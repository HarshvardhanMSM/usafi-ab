# USAFI WORKFORCE MANAGEMENT PLATFORM
## RECURRING JOBS — ARCHITECTURE DESIGN CORRECTION REPORT

**Document Version:** 1.0.0  
**Status:** Audit & Correction Pass Complete — Pending Final Architectural Approval  
**Target Platform:** Usafi Backend (Node.js / Express / TypeScript / Prisma ORM / PostgreSQL 17)  
**Author:** Principal Software Architect  
**Date:** September 30, 2026  

---

## 1. EXECUTIVE AUDIT SUMMARY

This audit report documents all technical corrections, algorithm clarifications, schema refinements, and test alignments performed during the architectural correction pass for Usafi Recurring Jobs.

Every contradiction identified in the initial draft has been analyzed, resolved, and updated across the three primary design specifications:
1. [`RECURRING_JOBS_ARCHITECTURE_SPECIFICATION.md`](file:///c:/Users/Dell/Desktop/MSM%20Projects/usafi%20AB/RECURRING_JOBS_ARCHITECTURE_SPECIFICATION.md)
2. [`RECURRING_JOBS_SCHEMA_IMPACT.md`](file:///c:/Users/Dell/Desktop/MSM%20Projects/usafi%20AB/RECURRING_JOBS_SCHEMA_IMPACT.md)
3. [`RECURRING_JOBS_TEST_MATRIX.md`](file:///c:/Users/Dell/Desktop/MSM%20Projects/usafi%20AB/RECURRING_JOBS_TEST_MATRIX.md)

---

## 2. DETAILED CORRECTION AUDIT & DECISION LOG

### ISSUE 1: `Shift.shiftCode` VARCHAR(20) Conflict with Proposed Shift Code Format

- **Issue Found:** In the initial specification draft, generated shift codes used the format `recurringJobCode + "-" + YYYYMMDD` (e.g., `RJ-2026-0001-20261005`). This string length is **21 characters**.
- **Why it is a Problem:** The existing approved `Shift` model in `schema.prisma` explicitly enforces `shiftCode String @unique @map("shift_code") @db.VarChar(20)`. Inserting a 21-character string triggers a PostgreSQL database runtime error: `value too long for type character varying(20)`.
- **Final Decision:** Establish a length-safe code format:
  - `recurringJobCode` format: `RJXXXX` (e.g., `RJ0001`, max 8 characters).
  - Generated `shiftCode` format: `RJXXXX-YYMMDD` (e.g., `RJ0001-261005`, exactly **13 characters**).
- **Exact Specification Change:** Updated Section 1, Section 5, Section 10 in `RECURRING_JOBS_ARCHITECTURE_SPECIFICATION.md` and Section 4 in `RECURRING_JOBS_SCHEMA_IMPACT.md`.
- **Affected Test Cases:** `DB-IDEM-02` updated to verify `shiftCode.length <= 20`.
- **Affected Schema Changes:** No change to existing `Shift.shiftCode` definition (`VARCHAR(20)` remains untouched). `recurring_jobs.recurring_job_code` restricted to `VARCHAR(20)` (max 8 chars used by convention).

---

### ISSUE 2: Weekly Recurrence Algorithm & UT-REC-05 Contradiction (Bi-Weekly Anchoring)

- **Issue Found:** Ambiguity existed in how the bi-weekly ($interval = 2$) calculation evaluates candidate weeks when `startDate` falls mid-week (e.g. Thursday Oct 1).
- **Why it is a Problem:** Without an explicit anchor week rule, implementations could either skip the week of `startDate` entirely or evaluate candidate dates inconsistently across server restarts.
- **Final Decision:** Introduce the **Deterministic Anchor Week Rule**:
  1. Define Anchor Week $W_{anchor}$ as the ISO-8601 week (starting Monday) containing `startDate` $D_0$.
  2. A candidate week $W_{cand}$ is valid if $\text{weeksBetween}(W_{anchor}, W_{cand}) \pmod I == 0$.
  3. A candidate date $D \in W_{cand}$ is valid if $D \ge D_0$ and $\text{weekday}(D) \in \text{byWeekdays}$.
- **Exact Specification Change:** Updated Section 6.2 in `RECURRING_JOBS_ARCHITECTURE_SPECIFICATION.md` with explicit math for aligned (Monday) and unaligned (mid-week) start dates.
- **Affected Test Cases:** Added `UT-REC-05B` in `RECURRING_JOBS_TEST_MATRIX.md` covering unaligned mid-week start date (`2026-10-01` Thursday, interval 2, Monday weekday $\rightarrow$ first occurrence on Oct 12). `UT-REC-05` retained for aligned start date (`2026-10-05` Monday $\rightarrow$ first occurrence on Oct 5).
- **Affected Schema Changes:** None.

---

### ISSUE 3: Hardcoded `Europe/London` Database Schema Default

- **Issue Found:** The initial schema impact document proposed `timezone String @default("Europe/London") @db.VarChar(50)` on `RecurringJob`.
- **Why it is a Problem:** Usafi is a multi-region platform. Hardcoding `'Europe/London'` in the Prisma schema forces regional assumptions at the database level and overrides clean fallback behavior for non-UK deployments.
- **Final Decision:** Remove `@default("Europe/London")` from `RecurringJob.timezone`. Implement the **Timezone Fallback Hierarchy**:
  1. `RecurringJob.timezone` (if explicitly provided by admin).
  2. `Location.timezone` (if specified on the associated `Location` entity).
  3. `SystemSettings` key `'DEFAULT_PLATFORM_TIMEZONE'` (if configured).
  4. Hard fallback to `'UTC'`.
- **Exact Specification Change:** Updated Section 5 and Section 7 in `RECURRING_JOBS_ARCHITECTURE_SPECIFICATION.md` and Section 2 & 3 in `RECURRING_JOBS_SCHEMA_IMPACT.md` (`timezone String? @db.VarChar(50)`).
- **Affected Test Cases:** `UT-TZ-01` updated to verify the fallback hierarchy when `RecurringJob.timezone` is null.
- **Affected Schema Changes:** `RecurringJob.timezone` is defined as optional `String? @db.VarChar(50)` without `@default`.

---

### ISSUE 4: Interaction Between Recurrence Rule Changes and `lastGeneratedUntil`

- **Issue Found:** If an admin changed schedule rules (e.g. from Weekly to Daily), a generator checking `lastGeneratedUntil < windowEnd` would skip dates prior to `lastGeneratedUntil`, causing missed occurrences under the new rule or leaving orphan shifts under the old rule.
- **Why it is a Problem:** Modifying template schedule rules without resetting generation progress creates schedule corruption and silent date gaps.
- **Final Decision:** Define the **Schedule Invalidation & Regeneration Protocol**:
  1. Historical shifts ($shiftDate < Today$) and assigned/overridden shifts are strictly preserved.
  2. Unassigned future shifts ($shiftDate \ge Today$, $assignments == 0$, $isOccurrenceOverride == false$) under the old rule are deleted from PostgreSQL.
  3. `lastGeneratedUntil` is reset to $\max(startDate, currentDate - 1 \text{ day})$.
  4. Generator immediately runs to populate occurrences for the 30-day window under the NEW rule.
- **Exact Specification Change:** Updated Section 14 in `RECURRING_JOBS_ARCHITECTURE_SPECIFICATION.md`.
- **Affected Test Cases:** `LIFE-04` updated to verify deletion of unassigned future shifts and reset of `lastGeneratedUntil`.
- **Affected Schema Changes:** None.

---

### ISSUE 5: Simplified `PAUSED` Behavior for V1

- **Issue Found:** The initial draft included complex admin toggles (*Keep Published* vs *Unpublish/Draft*) when pausing a job.
- **Why it is a Problem:** Introducing optional unpublish modes adds unnecessary API payload complexity, state ambiguity, and potential worker confusion for V1.
- **Final Decision:** Simplify `PAUSED` status for V1 to a zero-configuration, deterministic rule:
  - **When PAUSED:** No new occurrences are generated by background workers. Existing generated shifts remain completely unchanged in `PUBLISHED` status.
  - **When RESUMED:** Generation resumes from `currentDate` forward. No backfill for paused dates.
- **Exact Specification Change:** Updated Section 3, Section 11, Section 20 in `RECURRING_JOBS_ARCHITECTURE_SPECIFICATION.md`.
- **Affected Test Cases:** `LIFE-01` updated to verify simplified PAUSED behavior.
- **Affected Schema Changes:** None.

---

### ISSUE 6: Failure & Recovery Scenario Consistency Review

- **Issue Found:** Wording inconsistency in recovery scenarios regarding shift cancellation status vs unpublishing.
- **Why it is a Problem:** Inconsistent terminology creates implementation ambiguity between soft-deleting shifts vs transitioning to `ShiftStatus.CANCELLED`.
- **Final Decision:** Align all recovery scenarios to use explicit Prisma enum values: `ShiftStatus.PUBLISHED`, `ShiftStatus.CANCELLED`, and `RecurringJobStatus.PAUSED`.
- **Exact Specification Change:** Updated Section 20 in `RECURRING_JOBS_ARCHITECTURE_SPECIFICATION.md`.
- **Affected Test Cases:** `FAIL-01`, `FAIL-02`, `FAIL-03` updated.
- **Affected Schema Changes:** None.

---

### ISSUE 7: Schema Impact Audit & V1 Simplification

- **Issue Found:** Checked for extraneous fields or index bloat.
- **Why it is a Problem:** Unnecessary fields increase database migration risk and storage overhead.
- **Final Decision:** Confirmed that `recurring_jobs` table contains ONLY essential fields required for V1 recurrence calculations: `id`, `recurringJobCode`, `title`, `jobRoleId`, `locationId`, `timezone`, `startTimeOfDay`, `endTimeOfDay`, `breakDurationMinutes`, `payRateHourly`, `currency`, `requiredWorkers`, `description`, `requirements`, `adminNotes`, `status`, `recurrenceFrequency`, `interval`, `byWeekdays`, `byMonthDay`, `startDate`, `endDate`, `lastGeneratedUntil`, `createdById`, `createdAt`, `updatedAt`.
- **Exact Specification Change:** Updated `RECURRING_JOBS_SCHEMA_IMPACT.md`.
- **Affected Test Cases:** All DB test specs verified against simplified schema.
- **Affected Schema Changes:** No unnecessary fields added.

---

### ISSUE 8: Test Matrix Alignment Verification

- **Issue Found:** Test cases needed alignment with updated algorithms and code formats.
- **Why it is a Problem:** Mismatched test specs produce failing test suites during implementation.
- **Final Decision:** All test cases in `RECURRING_JOBS_TEST_MATRIX.md` updated to match length-safe codes (`RJ0001-261005`), anchor week rules (`UT-REC-05B`), timezone fallback (`UT-TZ-01`), simplified PAUSED behavior (`LIFE-01`), and rule change resets (`LIFE-04`).
- **Exact Specification Change:** Updated `RECURRING_JOBS_TEST_MATRIX.md`.
- **Affected Test Cases:** 100% of test cases in matrix reviewed and aligned.
- **Affected Schema Changes:** None.

---

## 3. UPDATED ARCHITECTURAL STATUS & APPROVAL FLOW

```
Current State: Correction & Audit Pass Complete ✅
               │
               ▼
Pending Step:  Final Architecture Approval
               │
               ▼
Next Steps:    Prisma Schema Update -> Migration -> DB Verification -> Engine Implementation
```

### Final Summary Statement:
- All 8 mandatory issues and contradictions have been resolved.
- All three design documents ([`RECURRING_JOBS_ARCHITECTURE_SPECIFICATION.md`](file:///c:/Users/Dell/Desktop/MSM%20Projects/usafi%20AB/RECURRING_JOBS_ARCHITECTURE_SPECIFICATION.md), [`RECURRING_JOBS_SCHEMA_IMPACT.md`](file:///c:/Users/Dell/Desktop/MSM%20Projects/usafi%20AB/RECURRING_JOBS_SCHEMA_IMPACT.md), [`RECURRING_JOBS_TEST_MATRIX.md`](file:///c:/Users/Dell/Desktop/MSM%20Projects/usafi%20AB/RECURRING_JOBS_TEST_MATRIX.md)) have been updated with exact, non-contradictory specifications.
- **No code, database tables, migrations, packages, or Prisma schemas were modified during this read-only audit.**
