# USAFI WORKFORCE MANAGEMENT PLATFORM
## RECURRING JOBS ARCHITECTURE SPECIFICATION & SYSTEM DESIGN

**Document Version:** 1.2.0 (Final Approval Correction Pass)  
**Status:** Architecture Correction Complete — Ready for Final Approval Audit  
**Target Platform:** Usafi Backend (Node.js / Express / TypeScript / Prisma ORM / PostgreSQL 17)  
**Author:** Principal Software Architect  
**Date:** September 30, 2026  

---

## 1. EXECUTIVE SUMMARY

The Usafi Workforce Management Platform currently manages worker operations through single, discrete `Shift` entities created individually by platform administrators. To support enterprise cleaning, security, facilities management, and staffing operations that operate on recurring schedules, Usafi requires a robust, scalable, and deterministic **Recurring Jobs Architecture**.

This specification defines the final architectural design for **Recurring Jobs** in Usafi. The core design principle is the strict operational and conceptual separation between a **Recurring Job** (the template, schedule rule, and policy definition) and a **Shift** (a concrete, scheduled operational work opportunity instance).

```
┌────────────────────────────────────────────────────────┐
│                     RecurringJob                       │
│    (Template: Role, Location, Rule, Window, Status)    │
└──────────────────────────┬─────────────────────────────┘
                           │
                           │ Occurrences Generation Engine
                           ▼
┌────────────────────────────────────────────────────────┐
│                     Shift Instance                     │
│    (Operational Unit: Date, Time, Pay, Workers)        │
└──────────────────────────┬─────────────────────────────┘
                           │ Operational Workflow
                           ▼
                 ┌───────────────────┐
                 │   StaffRequest    │
                 └─────────┬─────────┘
                           ▼
                 ┌───────────────────┐
                 │  ShiftAssignment  │
                 └─────────┬─────────┘
                           ▼
                 ┌───────────────────┐
                 │ AttendanceRecord  │
                 └─────────┬─────────┘
                           ▼
                 ┌───────────────────┐
                 │ Shift Completion  │
                 └─────────┬─────────┘
                           ▼
                 ┌───────────────────┐
                 │ Earnings/Reporting│
                 └───────────────────┘
```

### Key Architectural Tenets:
1. **Zero Shift Pollution:** `Shift` remains the atomic, concrete operational entity for staffing, requests, assignments, GPS-geofenced attendance, and payroll. `Shift` is not turned into a complex recurrence calculation object.
2. **Deterministic & Minimal Recurrence:** V1 strictly supports **Daily**, **Weekly**, and **Monthly** intervals with deterministic parameters (Every X days/weeks/months, weekday selections, day-of-month). Complex calendar RRULE strings, holiday engines, and bi-weekly as distinct types are explicitly excluded.
3. **Database-Enforced Idempotency:** Shift generation is strictly idempotent. A composite unique database constraint `(recurring_job_id, occurrence_date)` prevents duplicate shift creation regardless of concurrent workers, retries, or scheduler execution overlaps.
4. **Length-Safe Shift Codes:** Generated `shiftCode` strings adhere strictly to the existing schema constraint `Shift.shiftCode VARCHAR(20)`. The format `RJXXXX-YYMMDD` (e.g., `RJ0001-261005` = 13 characters) guarantees zero database string truncation errors.
5. **Exact Date Alignment:** `Shift.occurrenceDate` represents the local recurrence identity date, and `Shift.shiftDate` equals `Shift.occurrenceDate` (`shiftDate == occurrenceDate`). Overnight shifts crossing midnight retain their local `occurrenceDate` and `shiftDate`.
6. **Strict Lifecycle & Zero Silent Generation:** New templates are created with `status = DRAFT`. `DRAFT` templates generate ZERO shifts. Explicit activation changes status to `ACTIVE` and triggers occurrence generation.
7. **Safe Rule Change Invalidation:** Editing a schedule rule invalidates ONLY completely untouched future shifts (0 `StaffRequest` records, 0 `ShiftAssignment` records, and `isOccurrenceOverride == false`). Any shift with worker applications or assignments is strictly preserved.
8. **Decoupled Engine & PostgreSQL Source of Truth:** Background occurrence generation utilizes a BullMQ + Redis background worker architecture, driven by a daily cron ticker. PostgreSQL remains the absolute single source of truth; scheduler/queue states are fully transient and recoverable upon restart or crash.

---

## 2. CURRENT USAFI ARCHITECTURE IMPACT

An audit of the current Usafi backend codebase ([schema.prisma](file:///c:/Users/Dell/Desktop/MSM%20Projects/usafi%20AB/backend/prisma/schema.prisma), service layers, controllers, and database structure) reveals how Recurring Jobs integrate into the existing ecosystem:

| Existing Entity / Component | Current Role in Usafi | Recurring Job Integration Impact |
| :--- | :--- | :--- |
| **`Shift`** | Concrete work opportunity model with `shiftCode` (`VARCHAR(20)`), `shiftDate`, `startTime`, `endTime`, `payRateHourly`, `requiredWorkers`, etc. | Extended with three nullable/default fields: `recurringJobId` (FK), `occurrenceDate` (`Date`), and `isOccurrenceOverride` (`Boolean`). Core schema and operational workflow remain unchanged. `shiftDate == occurrenceDate`. |
| **`JobRole`** | Taxonomy of work roles (e.g. Cleaner, Guard). | Linked to `RecurringJob` via FK `jobRoleId`. |
| **`Location`** | Site location with GPS coordinates & geofence radius. | Linked to `RecurringJob` via FK `locationId`. (Note: Existing Location schema does not store timezone; fallback uses system default). |
| **`AdminUser`** | Platform administrators. | Linked to `RecurringJob` via FK `createdById`. |
| **`StaffRequest`** | Worker application for a shift. | **Unchanged.** Shifts with pending `StaffRequest` records are strictly protected from rule-change deletions. |
| **`ShiftAssignment`** | Confirmed assignment of a worker to a shift. | **Unchanged.** Shifts with `ShiftAssignment` records are strictly protected from rule-change deletions. |
| **`AttendanceRecord`** | GPS & time tracking of shift execution. | **Unchanged.** Tracks worker execution of individual generated `Shift` instances. |
| **`Notification`** | Push/In-app alerts for workers. | Triggered on publication/cancellation of generated `Shift` instances. |
| **`AuditLog`** | Immutable admin audit logging. | Records lifecycle events of `RecurringJob` (Create, Activate, Pause, Resume, Cancel, Edit Rule). |
| **`SystemSettings`** | Key-value settings table. | Stores global config: `RECURRING_JOB_GENERATION_WINDOW_DAYS` (default 30) and `DEFAULT_PLATFORM_TIMEZONE` (default 'UTC'). |

---

## 3. CONFIRMED V1 SCOPE

The V1 Recurring Jobs implementation includes:
- Administrative creation and lifecycle management of `RecurringJob` records starting in `DRAFT` status.
- Explicit activation workflow (`DRAFT` $\rightarrow$ `ACTIVE`) to trigger shift generation.
- Deterministic recurrence configuration for:
  - **Daily**: Every $X$ days ($X \ge 1$).
  - **Weekly**: Every $X$ weeks ($X \ge 1$) on specified weekdays (e.g., Monday, Wednesday, Friday). Bi-weekly is represented as Every 2 weeks on selected weekdays.
  - **Monthly**: Every $X$ months ($X \ge 1$) on a specific day of the month ($1 \le \text{day} \le 31$).
- Timezone awareness resolved via a strict 3-tier fallback hierarchy (Job $\rightarrow$ System Setting $\rightarrow$ UTC).
- Configurable rolling generation window (default: 30 days ahead).
- Background worker execution using BullMQ + Redis with idempotency guarantees.
- Simplified PAUSED status behavior (no generation; existing shifts remain unchanged).
- Safe rule change mechanics protecting shifts with requests, assignments, or overrides, resetting `lastGeneratedUntil`.
- Distinct parent job cancellation workflow notifying assigned workers.
- Overrides for individual generated shift instances without modifying the parent recurring rule or sibling shifts.
- Complete audit logging and failure recovery strategies.

---

## 4. EXPLICITLY EXCLUDED FEATURES

To prevent scope bloat and preserve system stability, the following features are **EXCLUDED** from V1:
- Arbitrary RRULE parsing engines (e.g., RFC 5545 calendar specs).
- Complex ordinal monthly expressions (e.g., "Last Friday of the month", "Second Tuesday of the month").
- Custom holiday calendars and automated holiday skipping engines.
- Adding a `timezone` field to the existing `Location` schema in V1.
- Multiple recurrence rules per recurring job.
- Complex PAUSED configuration toggles (e.g. Unpublish vs Keep Published).
- Automatic bulk assignment of staff to entire recurring job series (all assignments remain shift-level).
- Client-side recurrence rule evaluation in mobile (Flutter) applications.
- Bi-weekly as an explicit enum value (handled cleanly via Weekly with interval = 2).

---

## 5. DOMAIN MODEL

The proposed domain architecture introduces a minimal set of new entities to model recurring templates while preserving existing operational relationships.

```
┌─────────────────┐       1:N       ┌───────────────────┐
│    AdminUser    ├─────────────────┤   RecurringJob    │
└─────────────────┘                 └─────────┬─────────┘
                                              │
                                              │ 1:N
                                              ▼
┌─────────────────┐                 ┌───────────────────┐
│     JobRole     │◄────────────────┤       Shift       │
└─────────────────┘                 │  (Generated Instance)
                                    └─────────┬─────────┘
┌─────────────────┐                           │ 1:N
│    Location     │◄──────────────────────────┼─────────────────────────┐
└─────────────────┘                           │                         │
                                              ▼                         ▼
                                    ┌───────────────────┐     ┌───────────────────┐
                                    │   StaffRequest    │     │  ShiftAssignment  │
                                    └───────────────────┘     └─────────┬─────────┘
                                                                        │ 1:1
                                                                        ▼
                                                              ┌───────────────────┐
                                                              │ AttendanceRecord  │
                                                              └───────────────────┘
```

### Entity 1: `RecurringJob`

#### Essential Fields:
- `id`: UUID (PK)
- `recurringJobCode`: String (Unique, e.g. `RJ0001`, max 8 chars)
- `title`: String (VarChar 150)
- `jobRoleId`: UUID (FK -> `JobRole`)
- `locationId`: UUID (FK -> `Location`)
- `timezone`: String? (VarChar 50, e.g. "Europe/London", optional; no hardcoded DB default)
- `startTimeOfDay`: String (VarChar 5, format "HH:mm")
- `endTimeOfDay`: String (VarChar 5, format "HH:mm")
- `breakDurationMinutes`: Int
- `payRateHourly`: Decimal(10, 2)
- `currency`: String (VarChar 3)
- `requiredWorkers`: Int
- `description`: String?
- `requirements`: String?
- `adminNotes`: String?
- `status`: Enum `RecurringJobStatus` (`DRAFT`, `ACTIVE`, `PAUSED`, `COMPLETED`, `CANCELLED`) — **Default: `DRAFT`**
- `recurrenceFrequency`: Enum `RecurrenceFrequency` (`DAILY`, `WEEKLY`, `MONTHLY`)
- `interval`: Int (Default: 1. Represents every X days/weeks/months)
- `byWeekdays`: Int[] (Array of weekday numbers `[0..6]`, where 0=Sunday, 1=Monday, ..., 6=Saturday)
- `byMonthDay`: Int? (Day of month `[1..31]`)
- `startDate`: DateTime (`@db.Date`)
- `endDate`: DateTime? (`@db.Date`, null for infinite recurrence)
- `lastGeneratedUntil`: DateTime? (`@db.Date`, tracks the furthest occurrence date generated)
- `createdById`: UUID? (FK -> `AdminUser`)
- `createdAt`: Timestamptz(6)
- `updatedAt`: Timestamptz(6)

---

### Entity 2: `Shift` Extensions & Date Alignment

#### Fields Added to Existing `Shift` Model:
- `recurringJobId`: UUID? (FK -> `RecurringJob`, `onDelete: SetNull`)
- `occurrenceDate`: DateTime? (`@db.Date`, stores the local recurrence identity date)
- `isOccurrenceOverride`: Boolean (Default: `false`, set to `true` if an admin edits this shift's parameters individually)

#### Exact Date Alignment Rule:
- `occurrenceDate`: Local identity date calculated by recurrence algorithm.
- `shiftDate`: Existing operational `Shift.shiftDate`. For all generated shifts, `shiftDate` MUST equal `occurrenceDate` (`shiftDate == occurrenceDate`).
- **Overnight Shifts:** An overnight shift starting at 22:00 local on Oct 5 and ending at 06:00 local on Oct 6 has `occurrenceDate = 2026-10-05` and `shiftDate = 2026-10-05`. The UTC end timestamp (`endTime`) crosses midnight into Oct 6, but operational `shiftDate` and identity `occurrenceDate` remain `2026-10-05`.

#### Unique Constraint for Idempotency:
- `@@unique([recurringJobId, occurrenceDate])`

---

## 6. RECURRENCE LOGIC & ALGORITHMS

Recurrence calculations are purely deterministic and operate on local dates within the resolved timezone.

### 1. Daily Recurrence Algorithm
Given `startDate` $D_0$, `interval` $I \ge 1$:
$$\text{daysBetween}(D_0, D) \pmod I == 0$$

### 2. Weekly Recurrence Algorithm & Anchor Week Rule
Given `startDate` $D_0$, `interval` $I \ge 1$, `byWeekdays` $W \subseteq \{0..6\}$:
1. Define **Anchor Week** $W_{anchor}$ as the ISO-8601 week containing `startDate` $D_0$ (starting Monday).
2. For candidate week $W_{cand}$: $\text{weeksBetween}(W_{anchor}, W_{cand}) \pmod I == 0$.
3. Candidate date $D \in W_{cand}$ valid if $D \ge D_0$ and $\text{weekday}(D) \in W$.

### 3. Monthly Recurrence & Last-Day Fallback Policy
For month step $k \ge 0$ where $k \pmod I == 0$, calculate target month $Y_k$. If `byMonthDay` exceeds $\text{daysInMonth}(Y_k)$, clip occurrence date deterministically to the **last day of that month** (e.g. Feb 28/29 or Apr 30).

---

## 7. TIMEZONE DESIGN & FALLBACK HIERARCHY

```
┌─────────────────────────────────────────────────────────────┐
│ 1. 3-Tier Timezone Resolution Hierarchy (V1):              │
│    a. RecurringJob.timezone (if explicitly set)             │
│    b. SystemSettings ("DEFAULT_PLATFORM_TIMEZONE")           │
│    c. Hard Fallback: "UTC"                                  │
│                                                             │
│  *Note: Location.timezone is NOT in V1 schema and is NOT   │
│   used in timezone resolution.                              │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Date-Time Assembly (Luxon / Temporal):                   │
│    Local Start: 2026-03-29T08:00:00 [Resolved Timezone]     │
│    Local End:   2026-03-29T16:00:00 [Resolved Timezone]     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Conversion to UTC Timestamptz for Shift Storage:         │
│    startTime (UTC): 2026-03-29T07:00:00.000Z                 │
│    endTime   (UTC): 2026-03-29T15:00:00.000Z               │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. OCCURRENCE GENERATION & ROLLING WINDOW

Occurrence generation operates on a 30-day rolling window horizon.
- **Draft Status Rule:** Templates with `status = DRAFT` generate **ZERO** shifts.
- **Active Status Rule:** When status transitions `DRAFT` $\rightarrow$ `ACTIVE`, generation executes immediately up to $\min(\text{currentDate} + 30 \text{ days}, \text{endDate})$.

---

## 9. SCHEDULER ARCHITECTURE & BULLMQ / REDIS

BullMQ + Redis operates as the asynchronous background worker engine. PostgreSQL remains the sole source of truth. Redis holds zero domain state.

---

## 10. IDEMPOTENCY & CONCURRENCY CONTROL

Idempotency is guaranteed by composite unique constraint `@@unique([recurringJobId, occurrenceDate])` combined with `SELECT FOR UPDATE SKIP LOCKED` transactional locks.

---

## 11. RECURRING JOB STATUS LIFECYCLE

```
                ┌──────────┐
                │  DRAFT   │ (Created State — Generates 0 Shifts)
                └────┬─────┘
                     │ Admin Activates (POST /.../activate)
                     ▼
                ┌──────────┐      Pause Job       ┌──────────┐
                │  ACTIVE  ├─────────────────────►│  PAUSED  │
                └────┬─────┴◄─────────────────────┤          │
                     │          Resume Job        └──────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌────────────────┐      ┌────────────────┐
│   COMPLETED    │      │   CANCELLED    │
│ (End Date Met) │      │ (Admin Action) │
└────────────────┘      └────────────────┘
```

### Operational Status Rules:
1. `DRAFT`: Default creation state. Generates no shifts.
2. `ACTIVE`: Generated shifts maintained up to rolling window.
3. `PAUSED`: Generation suspended. Existing published shifts remain unchanged. Resuming starts from `currentDate` forward.
4. `COMPLETED`: Terminal state when `endDate` is reached.
5. `CANCELLED`: Terminal state. Future unassigned/unrequested shifts deleted/cancelled; affected assigned workers notified.

---

## 12. PARENT CANCELLATION VS RECURRENCE RULE CHANGES

The system strictly distinguishes between updating a recurrence rule versus cancelling a parent job:

| Aspect | Recurrence Rule Change (Edit Template) | Parent Job Cancellation (`CANCELLED`) |
| :--- | :--- | :--- |
| **Historical Shifts** | Strictly PRESERVED | Strictly PRESERVED |
| **Shifts with Assignments** | Strictly PRESERVED (unmodified) | Transitioned to `ShiftStatus.CANCELLED` |
| **Shifts with StaffRequests** | Strictly PRESERVED (unmodified) | Transitioned to `ShiftStatus.CANCELLED` |
| **Overridden Shifts** | Strictly PRESERVED | Transitioned to `ShiftStatus.CANCELLED` |
| **Untouched Future Shifts** | Deleted & regenerated under new rule | Transitioned to `ShiftStatus.CANCELLED` |
| **Worker Notifications** | None (no workers impacted) | Push & In-App cancellation alerts sent to assigned workers |

---

## 13. SAFE RECURRENCE RULE CHANGE MECHANICS

When an admin updates template schedule rules on an active job:

```
                       Admin Edits Schedule Rule
                                │
                                ▼
      ┌──────────────────────────────────────────────────┐
      │ 1. Historical / In-Progress Shifts (< Today):     │
      │    STRICTLY PRESERVED                            │
      └─────────────────────────┬────────────────────────┘
                                │
                                ▼
      ┌──────────────────────────────────────────────────┐
      │ 2. Future Shifts WITH Requests / Assignments:    │
      │    STRICTLY PRESERVED (Zero Worker Application Loss)│
      └─────────────────────────┬────────────────────────┘
                                │
                                ▼
      ┌──────────────────────────────────────────────────┐
      │ 3. Future Shifts WITH isOccurrenceOverride=true: │
      │    STRICTLY PRESERVED                            │
      └─────────────────────────┬────────────────────────┘
                                │
                                ▼
      ┌──────────────────────────────────────────────────┐
      │ 4. Completely Untouched Future Shifts:           │
      │    (0 Requests AND 0 Assignments AND Override=F) │
      │    DELETED / INVALIDATED FROM DB                 │
      └─────────────────────────┬────────────────────────┘
                                │
                                ▼
      ┌──────────────────────────────────────────────────┐
      │ 5. Generator Progress Tracking Reset:            │
      │    lastGeneratedUntil = max(startDate, today - 1)│
      └─────────────────────────┬────────────────────────┘
                                │
                                ▼
      ┌──────────────────────────────────────────────────┐
      │ 6. Immediate Regeneration Trigger:               │
      │    Generates NEW Occurrences under NEW Rule      │
      └──────────────────────────────────────────────────┘
```

---

## 14. INDIVIDUAL OCCURRENCE OVERRIDES

Editing an individual shift sets `Shift.isOccurrenceOverride = true`. Overridden shifts retain their edits and are protected from parent template rule changes.

---

## 15. STAFF REQUESTS & SHIFT ASSIGNMENTS INTEGRATION

Operational chain remains `RecurringJob -> Shift -> StaffRequest -> ShiftAssignment`. Staff apply for and work individual `Shift` instances.

---

## 16. ATTENDANCE & PAYMENT INTEGRATION

Attendance tracking (`AttendanceRecord`) and payment calculations operate 100% on concrete completed `Shift` instances.

---

## 17. NOTIFICATIONS & AUDIT LOGGING

Worker notifications are enqueued to BullMQ on shift publication/cancellation. All lifecycle operations on `RecurringJob` write to `AuditLog`.

---

## 18. FAILURE & RECOVERY SCENARIOS

Recovery mechanisms rely on PostgreSQL transactional consistency and BullMQ queue retries.

---

## 19. ADMIN UI & API PROPOSAL

Administrative REST endpoints under `/api/v1/admin/recurring-jobs`:
- `POST /api/v1/admin/recurring-jobs` (Creates job in `DRAFT` status; 0 shifts generated)
- `POST /api/v1/admin/recurring-jobs/:id/activate` (Transitions `DRAFT` $\rightarrow$ `ACTIVE`; triggers generation)
- `POST /api/v1/admin/recurring-jobs/:id/pause`
- `POST /api/v1/admin/recurring-jobs/:id/resume`
- `POST /api/v1/admin/recurring-jobs/:id/cancel`

---

## 20. TEST STRATEGY & RELIABILITY STATEMENT

The test strategy is designed to verify deterministic behavior, idempotency, transactional consistency, failure recovery, and financial correctness across defined V1 scenarios.

---

## 21. ARCHITECTURAL STATUS CLARIFICATION

Architecture correction complete. Ready for final approval audit.
