# Recurring Jobs — Occurrence Generation Implementation Report

**Phase:** Phase 3B — RecurringJob → Shift Occurrence Generation Layer  
**Status:** Complete & Verified  
**Date:** October 1, 2026  
**Target Platform:** Usafi Backend (`Node.js` / `Express` / `TypeScript` / `Prisma ORM` / `PostgreSQL 17`)  
**Author:** Antigravity AI Engine  

---

## 1. Scope

Phase 3B implements **ONLY** the pure `RecurringJob` $\rightarrow$ `Shift` occurrence generation layer, consuming the pure recurrence calculator from Phase 3A without duplicating calculation logic.

### In-Scope:
- Occurrence Generation Service (`OccurrenceGeneratorService`).
- 30-day rolling generation window based on `SystemSettings` (default 30 days).
- Horizon boundaries: $\max(\text{currentDate}, \text{startDate})$ to $\min(\text{currentDate} + \text{windowDays}, \text{endDate})$.
- Lifecycle status gating (`ACTIVE` only; `DRAFT`, `PAUSED`, `CANCELLED`, `COMPLETED` produce 0 shifts).
- 3-tier Timezone resolution ($Job \rightarrow SystemSettings \rightarrow UTC$) and pure local date/time $\rightarrow$ UTC conversion.
- Overnight shift handling (where $\text{endTimeOfDay} \le \text{startTimeOfDay}$, incrementing end date by +1 local day).
- Exact date alignment: `shiftDate == occurrenceDate` (local calendar date stored as UTC midnight).
- Length-safe `shiftCode` generation (`RJXXXX-YYMMDD`, max 13 chars, within `@db.VarChar(20)` constraint).
- Atomic and idempotent database creation using composite key `(recurringJobId, occurrenceDate)`.
- Transactional `lastGeneratedUntil` advancement strictly tied to shift generation.
- Multiple-staff compatibility copying `requiredWorkers` to `Shift.requiredWorkers`.
- 22 comprehensive occurrence generation unit/integration tests.

### Strictly Excluded (Deferred to Future Phases):
- BullMQ queue consumers & Redis worker processes.
- Daily cron schedulers / background tickers.
- Express routes, controllers, and REST endpoints.
- StaffRequest / ShiftAssignment creation.
- Attendance / Payments / Payroll logic.
- Rule-change reconciliation / Parent cancellation cascades.
- Schema modifications / Database migrations.

---

## 2. Files Created/Modified

### Files Created:
1. `backend/src/utils/timezone-date.ts`
   - Native local-to-UTC date-time conversion (`localDateTimeToUtc`), time parsing (`parseTimeToHoursMinutes`), length-safe shift code generation (`generateShiftCode`), and timezone calendar date formatting.
2. `backend/src/repositories/recurring-job.repository.ts`
   - Database repository for `RecurringJob`, `SystemSettings`, and idempotent `Shift` creation (`createShiftOccurrences`).
3. `backend/src/services/occurrence-generator.service.ts`
   - Core generation service (`OccurrenceGeneratorService` and `occurrenceGenerator` singleton) orchestrating recurrence calculation, timezone conversion, field mapping, and transactional updates.
4. `backend/tests/occurrence-generator.test.ts`
   - 22 Jest tests validating all generation rules, lifecycle gates, overnight shifts, timezone conversion, idempotency, and transactional safety.
5. `RECURRING_JOBS_OCCURRENCE_GENERATION_IMPLEMENTATION_REPORT.md`
   - This implementation verification report.

### Files Modified:
- `backend/src/types/recurrence.types.ts`: Extended with `OccurrenceGenerationOptions`, `GeneratedShiftMetadata`, and `OccurrenceGenerationResult`.

---

## 3. Recurrence Engine Integration

Phase 3B directly integrates with the pure recurrence engine from Phase 3A:
- Consumes `recurrenceCalculator.calculateOccurrences(...)` from `backend/src/services/recurrence-calculator.service.ts`.
- Zero algorithmic duplication for Daily, Weekly (Anchor Week rule), or Monthly (Last-Day fallback) calculations.

---

## 4. Rolling Window

- Window Horizon: `currentLocalCalendarDate` to $\min(\text{currentLocalCalendarDate} + \text{windowDays}, \text{job.endDate})$.
- Window Days: dynamically resolved via `SystemSettings.RECURRING_JOB_GENERATION_WINDOW_DAYS` (fallback `30`).
- Start Date: begins from $\max(\text{currentLocalCalendarDate}, \text{job.startDate})$.
- Historical occurrences prior to `currentDate` are **never** generated.

---

## 5. Timezone Conversion

- Timezone Resolution Hierarchy:
  1. `RecurringJob.timezone` (if set and valid IANA identifier).
  2. `SystemSettings.DEFAULT_PLATFORM_TIMEZONE` (if set and valid).
  3. Hard fallback: `'UTC'`.
- Local date/time conversion to UTC handles daylight saving time (DST) transitions (e.g. BST Summer Time in `Europe/London`, EAT in `Africa/Nairobi`) using standard `Intl.DateTimeFormat`.

---

## 6. Overnight Shift Handling

- Evaluated via $\text{endTimeOfDay} \le \text{startTimeOfDay}$ (e.g., `22:00` $\rightarrow$ `06:00`).
- Local start datetime: `occurrenceDate` at `startTimeOfDay`.
- Local end datetime: `occurrenceDate + 1 day` at `endTimeOfDay`.
- Local `occurrenceDate` and `shiftDate` remain identical to the local shift start date (e.g., `2026-10-05`), while `endTime` UTC timestamp crosses into next day (`2026-10-06T05:00:00.000Z`).

---

## 7. Shift Mapping

Generated `Shift` entities inherit directly from `RecurringJob` template:
- `title` $\leftarrow$ `RecurringJob.title`
- `jobRoleId` $\leftarrow$ `RecurringJob.jobRoleId`
- `locationId` $\leftarrow$ `RecurringJob.locationId`
- `shiftDate` $\leftarrow$ Local `occurrenceDate` (UTC midnight)
- `occurrenceDate` $\leftarrow$ Local `occurrenceDate` (UTC midnight)
- `startTime` $\leftarrow$ Converted UTC `DateTime`
- `endTime` $\leftarrow$ Converted UTC `DateTime`
- `breakDurationMinutes` $\leftarrow$ `RecurringJob.breakDurationMinutes`
- `payRateHourly` $\leftarrow$ `RecurringJob.payRateHourly`
- `currency` $\leftarrow$ `RecurringJob.currency`
- `requiredWorkers` $\leftarrow$ `RecurringJob.requiredWorkers`
- `description` $\leftarrow$ `RecurringJob.description`
- `requirements` $\leftarrow$ `RecurringJob.requirements`
- `adminNotes` $\leftarrow$ `RecurringJob.adminNotes`
- `status` $\leftarrow$ `ShiftStatus.PUBLISHED`
- `recurringJobId` $\leftarrow$ `RecurringJob.id`
- `isOccurrenceOverride` $\leftarrow$ `false`
- `createdById` $\leftarrow$ `RecurringJob.createdById`

---

## 8. Shift Code Generation

- Approved Format: `RJXXXX-YYMMDD` (e.g., `RJ0001-261005` for `RJ0001` on `2026-10-05`).
- Length: exactly 13 characters (well within `Shift.shiftCode @db.VarChar(20)`).

---

## 9. Idempotency

- Enforced at database level via composite unique constraint `@@unique([recurringJobId, occurrenceDate])`.
- Insertions use `createMany({ data: [...], skipDuplicates: true })` / PostgreSQL `ON CONFLICT DO NOTHING`.
- Repeated executions generate **zero** duplicate shifts and safely return existing states.

---

## 10. lastGeneratedUntil

- `RecurringJob.lastGeneratedUntil` is updated to the latest successfully processed generation horizon date (e.g. `2026-10-31`).
- Updated transactionally alongside shift creation.
- Never advanced if the generation transaction fails.

---

## 11. Transaction Safety

- Generation and `lastGeneratedUntil` update are wrapped inside a single database transaction (`prisma.$transaction`).
- If any error occurs, the transaction rolls back cleanly, leaving database state and `lastGeneratedUntil` unadvanced.

---

## 12. Multiple-Staff Compatibility

- `RecurringJob.requiredWorkers` ($N \ge 1$) is copied directly to generated `Shift.requiredWorkers`.
- Zero `StaffRequest` or `ShiftAssignment` records are created in Phase 3B. Shift-level staffing workflow remains atomic and untouched.

---

## 13. Test Results

### Test Suite Execution:
```
PASS tests/occurrence-generator.test.ts
  Recurring Jobs — Occurrence Generation Layer (Phase 3B)
    Status Lifecycle & Shift Generation Gate
      √ LIFE-01: DRAFT job generates ZERO shifts (4 ms)
      √ LIFE-01B: ACTIVE job generates occurrences up to rolling window (23 ms)
      √ LIFE-02: PAUSED job generates ZERO new shifts (1 ms)
      √ CANCELLED job generates ZERO shifts (1 ms)
      √ COMPLETED job generates ZERO shifts (1 ms)
    Rolling Generation Window & Horizon Boundaries
      √ 30-day rolling window generates shifts from currentDate to currentDate + 30 days (15 ms)
      √ UT-REC-10: endDate limits generation horizon when earlier than window (4 ms)
      √ startDate prevents historical generation when currentDate is after startDate (3 ms)
      √ startDate in future starts generation from startDate rather than currentDate (3 ms)
    Recurrence Frequencies Integration
      √ Daily recurring generation with interval 2 (3 ms)
      √ Weekly recurring generation with anchor week rule (Mon, Fri) (3 ms)
      √ Monthly recurring generation with 31st last-day fallback (3 ms)
    Timezone, Overnight Shifts & Exact Date Alignment
      √ UT-TZ-02: Date alignment (shiftDate === occurrenceDate) (2 ms)
      √ UT-TZ-04: Summer Time (BST, UTC+1) timestamp conversion (1 ms)
      √ UT-TZ-03: Overnight shift (22:00 to 06:00 next day) preserves occurrenceDate and shiftDate (1 ms)
      √ 3-Tier Timezone Fallback: Uses platform setting when job timezone is null (1 ms)
    Field Mapping, Shift Code & Multiple Staff Semantics
      √ DB-IDEM-02: Length-Safe shiftCode format (RJXXXX-YYMMDD <= 20 chars) (1 ms)
      √ Generated Shift copies requiredWorkers, pay rate, role, location, currency (2 ms)
    DB-IDEM-03: Idempotency & Transaction Safety
      √ Repeated generator execution produces ZERO duplicate shifts and updates lastGeneratedUntil cleanly (3 ms)
      √ Failed database transaction does NOT advance lastGeneratedUntil (5 ms)
      √ Multiple recurring jobs generate independently and remain isolated (2 ms)
      √ Existing one-time shifts (recurringJobId = null) are untouched by recurring generator (2 ms)

Test Suites: 2 passed, 2 total (including recurrence-calculator.test.ts)
Tests:       56 passed, 56 total
Snapshots:   0 total
```

### TypeScript Compilation:
```
> usafi-backend@1.0.0 typecheck
> tsc --noEmit
(Exited with code 0 - Zero Errors)
```

### Prisma Schema Validation:
```
> npx prisma validate
The schema at prisma\schema.prisma is valid 🚀
```

---

## 14. Schema Protection

- `backend/prisma/schema.prisma` was **NOT modified** in Phase 3B.
- The schema remains 100% frozen as approved in Phase 1 & 2.

---

## 15. Migration Protection

- **ZERO migrations** were created or modified in Phase 3B.

---

## 16. Git Diff

New files added in Phase 3B:
- `backend/src/utils/timezone-date.ts`
- `backend/src/repositories/recurring-job.repository.ts`
- `backend/src/services/occurrence-generator.service.ts`
- `backend/tests/occurrence-generator.test.ts`
- `RECURRING_JOBS_OCCURRENCE_GENERATION_IMPLEMENTATION_REPORT.md`

Files modified:
- `backend/src/types/recurrence.types.ts` (type definitions extended)

No modifications made to `backend/prisma/schema.prisma` or migration files during Phase 3B.

---

## 17. Deviations

- **None.** The implementation strictly conforms to all authoritative architecture specifications.

---

## 18. Final Verdict

**PASS — OCCURRENCE GENERATION COMPLETE**
