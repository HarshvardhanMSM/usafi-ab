# Recurring Jobs — Recurrence Engine Implementation Report

**Phase:** Phase 3A — Pure Recurrence Calculation Engine  
**Status:** Complete & Verified  
**Date:** October 1, 2026  
**Target Platform:** Usafi Backend (`Node.js` / `Express` / `TypeScript` / `Prisma ORM` / `PostgreSQL 17`)  
**Author:** Antigravity AI Engine  

---

## 1. Scope

Phase 3A implemented **ONLY** the pure, deterministic recurrence calculation engine for Recurring Jobs.

### In-Scope:
- Pure calculation of local calendar recurrence dates (`YYYY-MM-DD`).
- **Daily Recurrence Algorithm**: Interval $I \ge 1$, $\text{daysBetween}(D_0, D) \pmod I == 0$.
- **Weekly Recurrence Algorithm**: Deterministic Anchor Week Rule (Monday-based ISO week containing $startDate$, $\text{weeksBetween}(W_{anchor}, W_{cand}) \pmod I == 0$, $D \ge startDate$, $D_{\text{dow}} \in \text{byWeekdays}$).
- **Monthly Recurrence Algorithm**: Month step $k \pmod I == 0$, Last-Day Fallback policy for shorter months (Feb 28/29, Apr 30, etc.).
- Explicit calculation window, boundary clamping, and safety constraints.
- 3-tier Timezone Resolution helper ($Job \rightarrow SystemSettings \rightarrow UTC$).
- Comprehensive validation rules for recurrence configurations with Zod schemas and `ApiError.validationError`.
- Comprehensive unit test suite covering all matrix test cases.

### Strictly Excluded (Deferred to Future Phases):
- Database generation / Prisma writes.
- Shift record creation.
- BullMQ / Redis queues.
- Schedulers / Cron tickers.
- Express routes, controllers, and REST endpoints.
- StaffRequest / ShiftAssignment logic.
- Notifications / Audit logging.
- Prisma schema modifications / Database migrations.

---

## 2. Files Created/Modified

### Files Created:
1. `backend/src/types/recurrence.types.ts`
   - Defines TypeScript interfaces: `RecurrenceRuleInput`, `RecurrenceCalculationOptions`, `CalendarDateParts`, `OccurrenceResult`, and `RecurrenceValidationResult`.
2. `backend/src/validators/recurrence.validator.ts`
   - Contains `recurrenceRuleSchema` (Zod), `validateRecurrenceRule`, `assertValidRecurrenceRule`, `isValidIanaTimezone`, and `toCalendarDateString`.
3. `backend/src/services/recurrence-calculator.service.ts`
   - Core pure recurrence calculation engine (`RecurrenceCalculatorService` and `recurrenceCalculator` singleton).
4. `backend/tests/recurrence-calculator.test.ts`
   - 34 comprehensive Jest unit tests covering all matrix scenarios.
5. `RECURRING_JOBS_RECURRENCE_ENGINE_IMPLEMENTATION_REPORT.md`
   - This implementation verification report.

### Files Modified:
- *None.* Existing code was untouched.

---

## 3. Recurrence Algorithms Implemented

### Daily Recurrence
- Given start date $D_0$ and interval $I \ge 1$:
$$\text{Occurrence date } D_k = D_0 + (k \times I) \text{ days, for } k \ge 0$$
$$\text{Condition: } D_k \ge \max(D_0, \text{windowStartDate}) \text{ and } D_k \le \min(endDate, \text{windowEndDate})$$

### Weekly Recurrence (Deterministic Anchor Week Rule)
- Anchor week Monday $W_{\text{anchor}} = \text{getMondayOfWeek}(D_0)$.
- For week index $w \ge 0$ where $w \pmod I == 0$:
  - Current week Monday $W_w = W_{\text{anchor}} + (w \times 7) \text{ days}$.
  - Candidate date $D \in \{W_w + 0, \dots, W_w + 6\}$ is valid if:
    1. $\text{weekday}(D) \in \text{byWeekdays}$
    2. $D \ge D_0$
    3. $D \le endDate$ (if $endDate$ exists)
    4. $D \ge \text{windowStartDate}$ and $D \le \text{windowEndDate}$

### Monthly Recurrence (Last-Day Fallback Policy)
- For month step $k \ge 0$ where $k \pmod I == 0$:
  - Target year $Y_k = Y_0 + \lfloor (M_0 - 1 + k) / 12 \rfloor$
  - Target month $M_k = ((M_0 - 1 + k) \pmod{12}) + 1$
  - Target day $D_k = \min(\text{byMonthDay}, \text{daysInMonth}(Y_k, M_k))$
  - Candidate date $D = (Y_k, M_k, D_k)$ is valid if $D \ge D_0$ and $D \le endDate$.

---

## 4. Daily Rule Verification

Verified against test matrix:
- **UT-REC-01 (Daily Interval 1):** Start 2026-10-01, 5 days window $\rightarrow$ generated `['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05']`. **PASS**
- **UT-REC-02 (Daily Interval 3):** Start 2026-10-01, 10 days window $\rightarrow$ generated `['2026-10-01', '2026-10-04', '2026-10-07', '2026-10-10']`. **PASS**
- **Start Boundary:** Window starting prior to $startDate$ correctly clamps occurrences $\ge startDate$. **PASS**
- **UT-REC-10 (End Date Compliance):** Respects $endDate$ upper bound without generating excess occurrences. **PASS**

---

## 5. Weekly Rule Verification

Verified against test matrix:
- **UT-REC-03 (Weekly Single Weekday):** Start 2026-10-01 (Thu), interval 1, `byWeekdays = [1]` (Mon) $\rightarrow$ generated `['2026-10-05', '2026-10-12', '2026-10-19']`. **PASS**
- **UT-REC-04 (Weekly Multiple Weekdays):** Start 2026-10-01, `byWeekdays = [1, 3, 5]` (Mon, Wed, Fri) $\rightarrow$ Sep 28 & 30 skipped (< Oct 1), generates `['2026-10-02', '2026-10-05', '2026-10-07', '2026-10-09']`. **PASS**
- **UT-REC-05 (Bi-Weekly Aligned):** Start 2026-10-05 (Mon), interval 2, `byWeekdays = [1]` $\rightarrow$ generated `['2026-10-05', '2026-10-19', '2026-11-02']`. **PASS**
- **UT-REC-05B (Bi-Weekly Unaligned Start Date):** Start 2026-10-01 (Thu), interval 2, `byWeekdays = [1]`. Anchor week Sep 28 Mon skipped (< Oct 1), week 1 skipped by interval=2 $\rightarrow$ first occurrence is Monday Oct 12 (`['2026-10-12', '2026-10-26', '2026-11-09']`). **PASS**

---

## 6. Monthly Rule Verification

Verified against test matrix:
- **UT-REC-06 (Standard Day):** Start 2026-01-15, interval 1, `byMonthDay = 15` $\rightarrow$ `['2026-01-15', '2026-02-15', '2026-03-15', '2026-04-15']`. **PASS**
- **UT-REC-07 (Bi-Monthly Interval 2):** Start 2026-01-10, interval 2, `byMonthDay = 10` $\rightarrow$ `['2026-01-10', '2026-03-10', '2026-05-10', '2026-07-10']`. **PASS**
- **UT-REC-08 (31st Day Short Month Fallback):** Start 2026-01-31, `byMonthDay = 31` $\rightarrow$ Feb 28 (last day of Feb 2026), Mar 31, Apr 30 (last day of Apr). **PASS**
- **UT-REC-09 (Leap Year Feb 29 Fallback):** Start 2028-01-31, `byMonthDay = 31` $\rightarrow$ Feb 29, 2028. **PASS**
- **Start Month Offset:** Start 2026-01-20 with `byMonthDay = 10` skips Jan 10 (< Jan 20) and starts on Feb 10, 2026. **PASS**

---

## 7. Boundary Verification

- Validates $startDate \le D \le endDate$.
- Clamps to calculation window `[windowStartDate, windowEndDate]`.
- Implements `maxOccurrences` safeguard preventing infinite loops.
- Returns empty array `[]` when windows do not overlap or exceed $endDate$.
- Verifies deterministic repeat execution across 100 iterations with identical arrays. **PASS**

---

## 8. Timezone Handling

- **UT-TZ-01 (3-Tier Fallback):**
  1. `RecurringJob.timezone` (if set and valid IANA string).
  2. `SystemSettings.DEFAULT_PLATFORM_TIMEZONE` (if set and valid IANA string).
  3. Hard fallback: `'UTC'`.
- Validates IANA timezone identifiers using standard `Intl.DateTimeFormat`.
- Calculation engine remains pure and accepts resolved timezones without database queries. **PASS**

---

## 9. Validation

Comprehensive validation checks:
- Rejects non-integer or $< 1$ intervals.
- Rejects `WEEKLY` frequency without `byWeekdays` or with empty arrays.
- Rejects invalid weekday numbers outside `[0..6]`.
- Rejects `MONTHLY` frequency without `byMonthDay` or outside `[1..31]`.
- Rejects $endDate < startDate$.
- Rejects non-existent calendar dates (e.g. `2026-02-30`).
- Rejects invalid IANA timezone identifiers.
- Throws standard `ApiError.validationError` on assertion failure. **PASS**

---

## 10. Test Results

Executed Jest unit test suite:
```
PASS tests/recurrence-calculator.test.ts
  Recurring Jobs — Pure Recurrence Calculation Engine (Phase 3A)
    Daily Recurrence Algorithm
      √ UT-REC-01: Daily Recurrence — Interval 1 (Window = 5 days) (4 ms)
      √ UT-REC-02: Daily Recurrence — Interval 3 (Window = 10 days) (1 ms)
      √ Daily Recurrence — Start date boundary compliance (1 ms)
      √ UT-REC-10: Recurrence End Date Compliance (Daily) (1 ms)
      √ Daily isOccurrenceDate evaluation (1 ms)
    Weekly Recurrence Algorithm (Deterministic Anchor Week Rule)
      √ UT-REC-03: Weekly Recurrence — Single Weekday (Interval 1) (1 ms)
      √ UT-REC-04: Weekly Recurrence — Multiple Weekdays (Mon, Wed, Fri) (7 ms)
      √ UT-REC-05: Bi-Weekly Recurrence — Aligned Start Date (1 ms)
      √ UT-REC-05B: Bi-Weekly Recurrence — Unaligned Start Date (Anchor Week skips early weekday) (1 ms)
      √ Weekly Recurrence — Sunday (0) and Saturday (6) selection (1 ms)
      √ Weekly isOccurrenceDate evaluation (1 ms)
    Monthly Recurrence Algorithm (Last-Day Fallback Policy)
      √ UT-REC-06: Monthly Recurrence — Standard Day (15th of month) (1 ms)
      √ UT-REC-07: Monthly Recurrence — Bi-Monthly (Interval 2)
      √ UT-REC-08: Monthly Recurrence — 31st Day (Short Months Last-Day Fallback) (1 ms)
      √ UT-REC-09: Monthly Recurrence — Leap Year Feb 29 Fallback (1 ms)
      √ Monthly Recurrence — startDate after byMonthDay in start month
      √ Monthly isOccurrenceDate evaluation (1 ms)
    Calculation Windows, Limits & Determinism
      √ maxOccurrences limit stops generation early (1 ms)
      √ Deterministic repeated execution (100 repeated runs produce identical outputs) (18 ms)
      √ calculateOccurrencesDetailed returns properly formatted metadata (1 ms)
      √ getNextOccurrenceDate retrieves next chronological date (3 ms)
      √ Empty result when window is out of range or past endDate (1 ms)
    UT-TZ-01: 3-Tier Timezone Fallback Resolution
      √ Tier 1: Resolves job timezone when explicitly provided (16 ms)
      √ Tier 2: Falls back to SystemSettings DEFAULT_PLATFORM_TIMEZONE when job timezone is null/empty
      √ Tier 3: Falls back to hard default UTC when neither job nor system timezone is set (1 ms)
      √ Rejects invalid IANA timezone in fallback resolution
      √ Validates recognized IANA timezone strings (1 ms)
    Validation & Error Handling
      √ Rejects invalid interval (< 1 or non-integer) (1 ms)
      √ Rejects WEEKLY frequency without byWeekdays or with empty array
      √ Rejects invalid weekday values (e.g. 7 or -1 or decimals) (1 ms)
      √ Rejects MONTHLY frequency without byMonthDay or out of range [1..31]
      √ Rejects endDate before startDate
      √ Rejects invalid calendar date strings (e.g. 2026-02-30)
      √ assertValidRecurrenceRule throws ApiError.validationError on invalid rule (13 ms)

Test Suites: 1 passed, 1 total
Tests:       34 passed, 34 total
Snapshots:   0 total
Time:        1.769 s
```

TypeScript compilation check (`npm run typecheck`):
```
> usafi-backend@1.0.0 typecheck
> tsc --noEmit
(Exited with code 0 - Zero Errors)
```

---

## 11. Schema Protection

- `backend/prisma/schema.prisma` was **NOT modified** in Phase 3A.
- The schema remains 100% frozen as approved in Phase 1 & 2.

---

## 12. Migration Protection

- **ZERO migrations** were created or modified in Phase 3A.

---

## 13. Git Diff

New files added in Phase 3A:
- `backend/src/types/recurrence.types.ts`
- `backend/src/validators/recurrence.validator.ts`
- `backend/src/services/recurrence-calculator.service.ts`
- `backend/tests/recurrence-calculator.test.ts`
- `RECURRING_JOBS_RECURRENCE_ENGINE_IMPLEMENTATION_REPORT.md`

No modifications made to `backend/prisma/schema.prisma` or migration files during Phase 3A.

---

## 14. Deviations

- **None.** The implementation adheres strictly to the approved specification documents.

---

## 15. Final Verdict

**PASS — RECURRENCE ENGINE COMPLETE**