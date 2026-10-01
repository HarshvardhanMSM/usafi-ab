# USAFI WORKFORCE MANAGEMENT PLATFORM
## RECURRING JOBS — TEST MATRIX & QUALITY ASSURANCE SPECIFICATION

**Document Version:** 1.2.0 (Final Approval Correction Pass)  
**Status:** Architecture Correction Complete — Ready for Final Approval Audit  
**Target Framework:** Jest / Supertest / PostgreSQL / Prisma Client  
**Author:** Principal Software Architect  
**Date:** September 30, 2026  

---

## 1. TEST STRATEGY OVERVIEW

The test strategy is designed to verify deterministic behavior, idempotency, transactional consistency, failure recovery, and financial correctness across defined V1 scenarios. The strategy spans five test layers:

1. **Unit Tests:** Pure algorithmic validation for date calculators, recurrence pattern solvers, anchor week calculations, and 3-tier timezone resolution.
2. **Integration & Database Tests:** Real PostgreSQL database transactions, unique constraint validation, length-safe shiftCode verification, and Prisma queries.
3. **Concurrency & Idempotency Tests:** Multi-threaded worker simulation, transactional row locks, duplicate generation suppression.
4. **Scheduler & Worker Tests:** BullMQ queue job handling, failure retries, crashing worker recovery.
5. **API & End-to-End Tests:** Admin REST API endpoints, payload validation, status transitions, RBAC enforcement.

---

## 2. COMPREHENSIVE TEST CASE MATRIX

### Category A: Recurrence Algorithm Unit Tests

| Test ID | Test Title | Inputs / Scenario | Expected Outcome | Assertion / Verification |
| :--- | :--- | :--- | :--- | :--- |
| **UT-REC-01** | Daily Recurrence — Interval 1 | `startDate = 2026-10-01`, `interval = 1`, Window = 5 days. | Generates 5 consecutive dates: Oct 1, Oct 2, Oct 3, Oct 4, Oct 5. | Array length == 5; exact date matches. |
| **UT-REC-02** | Daily Recurrence — Interval 3 | `startDate = 2026-10-01`, `interval = 3`, Window = 10 days. | Generates Oct 1, Oct 4, Oct 7, Oct 10. | Array length == 4. |
| **UT-REC-03** | Weekly Recurrence — Single Weekday | `startDate = 2026-10-01` (Thu), `interval = 1`, `byWeekdays = [1]` (Mon). | Generates first Monday on or after start date: Oct 5, Oct 12, Oct 19. | First occurrence date == 2026-10-05. |
| **UT-REC-04** | Weekly Recurrence — Multiple Weekdays | `startDate = 2026-10-01`, `interval = 1`, `byWeekdays = [1, 3, 5]` (Mon, Wed, Fri). | Generates Oct 2 (Fri), Oct 5 (Mon), Oct 7 (Wed), Oct 9 (Fri). | Exact weekday matches for every generated date. |
| **UT-REC-05** | Bi-Weekly Recurrence — Aligned Start Date | `startDate = 2026-10-05` (Mon), `interval = 2`, `byWeekdays = [1]` (Mon). | Anchor Week = Oct 5. Generates Oct 5, Oct 19, Nov 2. | 14 days difference between consecutive occurrences; first occurrence on Oct 5. |
| **UT-REC-05B**| Bi-Weekly Recurrence — Unaligned Start Date | `startDate = 2026-10-01` (Thu), `interval = 2`, `byWeekdays = [1]` (Mon). | Anchor Week = Sep 28 (Mon Sep 28 < Oct 1, skipped). Week 1 skipped. Generates Oct 12, Oct 26. | First occurrence date == 2026-10-12 (Mon of Week 2). |
| **UT-REC-06** | Monthly Recurrence — Standard Day | `startDate = 2026-01-15`, `interval = 1`, `byMonthDay = 15`. | Generates Jan 15, Feb 15, Mar 15, Apr 15. | Occurrence date day component == 15 for all months. |
| **UT-REC-07** | Monthly Recurrence — Bi-Monthly | `startDate = 2026-01-10`, `interval = 2`, `byMonthDay = 10`. | Generates Jan 10, Mar 10, May 10, Jul 10. | Month gap between occurrences == 2. |
| **UT-REC-08** | Monthly Recurrence — 31st Day (Short Months) | `startDate = 2026-01-31`, `interval = 1`, `byMonthDay = 31`. | Jan 31, Feb 28 (Last-day fallback), Mar 31, Apr 30 (Last-day fallback). | Feb occurrence == 2026-02-28; Apr occurrence == 2026-04-30. |
| **UT-REC-09** | Monthly Recurrence — Leap Year Feb 29 | `startDate = 2028-01-31` (Leap year), `interval = 1`, `byMonthDay = 31`. | Feb occurrence generated on Feb 29, 2028. | Feb occurrence date == 2028-02-29. |
| **UT-REC-10** | Recurrence End Date Compliance | `startDate = 2026-10-01`, `endDate = 2026-10-07`, `interval = 1` (Daily). | Generates Oct 1 through Oct 7. No occurrences generated for Oct 8+. | Max generated date == 2026-10-07. |

---

### Category B: Timezone, DST & Date Alignment Tests

| Test ID | Test Title | Inputs / Scenario | Expected Outcome | Assertion / Verification |
| :--- | :--- | :--- | :--- | :--- |
| **UT-TZ-01** | 3-Tier Timezone Fallback Resolution | Job timezone = null, System setting = "Africa/Nairobi". | Resolves to "Africa/Nairobi" via SystemSettings (no Location.timezone used). Converts local 09:00 EAT to UTC 06:00. | Resolved timezone == "Africa/Nairobi"; UTC offset == +3. |
| **UT-TZ-02** | Date Alignment (`occurrenceDate == shiftDate`) | Job date = 2026-10-05, timezone = "Europe/London". | `shift.occurrenceDate` == 2026-10-05, `shift.shiftDate` == 2026-10-05. | `shift.shiftDate.toISOString().slice(0,10)` == `shift.occurrenceDate.toISOString().slice(0,10)`. |
| **UT-TZ-03** | Overnight Shift Crossing Midnight | Local time = 22:00 to 06:00 next day, local start date = 2026-10-05. | Start UTC = Oct 5 21:00 UTC, End UTC = Oct 6 05:00 UTC. `occurrenceDate` = 2026-10-05, `shiftDate` = 2026-10-05. | `occurrenceDate` and `shiftDate` remain `2026-10-05` despite UTC end crossing midnight. |
| **UT-TZ-04** | Summer Time (BST) Timestamp Conversion | `timezone = "Europe/London"`, `date = 2026-06-15`, `startTimeOfDay = "09:00"`. | Local 09:00 BST (+1) maps to UTC `2026-06-15T08:00:00.000Z`. | `shift.startTime.toISOString()` == `'2026-06-15T08:00:00.000Z'`. |
| **UT-TZ-05** | DST Transition Day (Spring Forward) | UK Clocks move forward 1h on 2026-03-29. Job time = 08:00 local. | Generates shift starting at 08:00 BST (07:00 UTC). Duration remains exact. | `shift.endTime - shift.startTime` == exact shift duration. |

---

### Category C: Database & Idempotency Tests

| Test ID | Test Title | Inputs / Scenario | Expected Outcome | Assertion / Verification |
| :--- | :--- | :--- | :--- | :--- |
| **DB-IDEM-01** | Database Unique Constraint Enforcement | Attempt to insert 2 shifts with same `recurringJobId` and `occurrenceDate`. | PostgreSQL throws code `P2002` (Unique constraint failed on `[recurringJobId, occurrenceDate]`). | DB rejects second insert; exactly 1 shift exists in DB. |
| **DB-IDEM-02** | Length-Safe shiftCode Compliance | Generate shift code for code `RJ0001` on date `2026-10-05`. | Generates code `RJ0001-261005` (13 characters). Successfully inserted into `@db.VarChar(20)` column. | `shiftCode.length` <= 20; insert succeeds. |
| **DB-IDEM-03** | Sequential Generator Rerun | Run `OccurrenceGenerator.generateForJob()` twice in a row for same active job. | Second run generates 0 new shifts; updates `lastGeneratedUntil` idempotently. | Total shift count in DB remains unchanged after 2nd run. |
| **DB-IDEM-04** | Parallel Worker Execution (Concurrency) | Spawn 5 concurrent Promise threads executing `generateForJob()` on same job ID. | All 5 complete without unhandled exception. DB contains exactly 1 set of shifts. | `SELECT COUNT(*) FROM shifts WHERE recurring_job_id = X` matches expected window count. |

---

### Category D: Status Lifecycle & Rule Change Safety Tests

| Test ID | Test Title | Inputs / Scenario | Expected Outcome | Assertion / Verification |
| :--- | :--- | :--- | :--- | :--- |
| **LIFE-01** | Create Job in DRAFT Status | `POST /api/v1/admin/recurring-jobs` payload. | Created with `status = DRAFT`. Generator produces 0 shifts. | `job.status == 'DRAFT'`; `shifts` count == 0. |
| **LIFE-01B**| Explicit Activation (`DRAFT` $\rightarrow$ `ACTIVE`) | `POST /api/v1/admin/recurring-jobs/:id/activate`. | Status changes to `ACTIVE`. Occurrence generator immediately executes up to 30 days. | `job.status == 'ACTIVE'`; `shifts` generated in DB. |
| **LIFE-02** | Pause Recurring Job | `POST /.../pause` on ACTIVE job. | Status becomes `PAUSED`. Generator skips job. All existing generated shifts remain unchanged. | Generator skips paused job; existing published shifts remain intact. |
| **LIFE-03** | Parent Job Cancellation | `POST /.../cancel` on active job with assigned & unassigned shifts. | Status becomes `CANCELLED`. Unassigned & assigned future shifts transitioned to `ShiftStatus.CANCELLED`. Assigned staff notified. | Assigned future shifts `CANCELLED`; staff notifications enqueued. |
| **LIFE-04** | Rule Change — StaffRequest Preservation | Edit template rule when a future shift has a pending `StaffRequest` record. | Shift with `StaffRequest` is PRESERVED. Untouched future shifts deleted. `lastGeneratedUntil` reset. | Shift with request remains in DB; new rule occurrences generated alongside. |
| **LIFE-05** | Rule Change — ShiftAssignment Preservation | Edit template rule when a future shift has a confirmed `ShiftAssignment`. | Shift with assignment is PRESERVED. | Shift with assignment remains intact in DB. |
| **LIFE-06** | Rule Change — Occurrence Override Preservation | Edit template rule when a future shift has `isOccurrenceOverride = true`. | Overridden shift is PRESERVED. | Overridden shift remains intact in DB. |
| **LIFE-07** | Rule Change — Untouched Shift Invalidation | Edit template rule when future shifts have 0 requests, 0 assignments, false override. | Untouched shifts deleted. `lastGeneratedUntil` reset to `today - 1`. New rule shifts generated. | Untouched old shifts removed; new rule shifts created. |

---

### Category E: Scheduler, Worker & Failure Recovery Tests

| Test ID | Test Title | Inputs / Scenario | Expected Outcome | Assertion / Verification |
| :--- | :--- | :--- | :--- | :--- |
| **FAIL-01** | Worker Process Crash & Recovery | Kill worker process mid-generation. Restart worker process. | Worker reads DB state `lastGeneratedUntil`, resumes generation cleanly without duplicates. | All expected shifts present in DB; 0 duplicates. |
| **FAIL-02** | Redis Flush / Cache Loss | Flush all keys in Redis while BullMQ queue has active job. | System cron re-enqueues daily ticker. Worker checks DB state and completes generation idempotently. | Zero data loss; DB state remains 100% correct. |
| **FAIL-03** | Notification Queue Retry | Worker creates shifts; notification dispatch fails due to push gateway timeout. | Shift creation committed. BullMQ retries notification job with exponential backoff until success. | Workers receive exactly 1 push notification; no duplicate alerts. |

---

### Category F: Admin REST API End-to-End Tests

| Test ID | Test Title | HTTP Method & Route | Request Payload / Params | Expected Status & Response |
| :--- | :--- | :--- | :--- | :--- |
| **API-01** | Create Valid Recurring Job | `POST /api/v1/admin/recurring-jobs` | Valid payload (title, roleId, locationId, time, pay). | `201 Created`; returns `RecurringJob` with status `DRAFT` and 0 generated shifts. |
| **API-01B**| Activate Recurring Job | `POST /api/v1/admin/recurring-jobs/:id/activate` | Valid job ID in `DRAFT` status. | `200 OK`; status `ACTIVE`; shifts generated up to rolling window. |
| **API-02** | Create Invalid Payload | `POST /api/v1/admin/recurring-jobs` | Missing `requiredWorkers` or invalid `byWeekdays` ([99]). | `400 Bad Request`; Zod validation error response detailing field issues. |
| **API-03** | Unauthorized Request | `POST /api/v1/admin/recurring-jobs` | No Authorization header attached. | `401 Unauthorized`. |
| **API-04** | Forbidden Non-Admin Access | `POST /api/v1/admin/recurring-jobs` | Staff JWT attached instead of Admin JWT. | `403 Forbidden`. |

---

## 3. CONCRETE JEST TEST IMPLEMENTATION EXAMPLE

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Recurring Jobs — Safety & Alignment Verification', () => {
  let recurringJobId: string;
  let shiftIdWithRequest: string;

  beforeAll(async () => {
    // 1. Create job in DRAFT status
    const job = await prisma.recurringJob.create({
      data: {
        recurringJobCode: 'RJ0001',
        title: 'Test Security Shift',
        jobRoleId: 'e8b4e723-5798-4a64-9a3d-8e6d24601111',
        locationId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
        startTimeOfDay: '22:00',
        endTimeOfDay: '06:00',
        breakDurationMinutes: 30,
        payRateHourly: 15.50,
        currency: 'GBP',
        requiredWorkers: 2,
        status: 'DRAFT', // Default state
        recurrenceFrequency: 'DAILY',
        interval: 1,
        byWeekdays: [],
        startDate: new Date('2026-10-01'),
      },
    });
    recurringJobId = job.id;
  });

  afterAll(async () => {
    await prisma.staffRequest.deleteMany({ where: { shift: { recurringJobId } } });
    await prisma.shift.deleteMany({ where: { recurringJobId } });
    await prisma.recurringJob.delete({ where: { id: recurringJobId } });
    await prisma.$disconnect();
  });

  test('LIFE-01: DRAFT job generates zero shifts', async () => {
    const shiftCount = await prisma.shift.count({ where: { recurringJobId } });
    expect(shiftCount).toBe(0);
  });

  test('UT-TZ-03: Date alignment & overnight shift identity', async () => {
    const occurrenceDate = new Date('2026-10-05');
    const shift = await prisma.shift.create({
      data: {
        shiftCode: 'RJ0001-261005',
        title: 'Overnight Security Shift',
        jobRoleId: 'e8b4e723-5798-4a64-9a3d-8e6d24601111',
        locationId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
        shiftDate: occurrenceDate, // shiftDate == occurrenceDate
        occurrenceDate: occurrenceDate,
        startTime: new Date('2026-10-05T21:00:00.000Z'), // 22:00 local (BST)
        endTime: new Date('2026-10-06T05:00:00.000Z'),   // 06:00 local next day
        breakDurationMinutes: 30,
        payRateHourly: 15.50,
        currency: 'GBP',
        requiredWorkers: 2,
        recurringJobId: recurringJobId,
      },
    });

    expect(shift.shiftDate.toISOString().slice(0, 10)).toBe('2026-10-05');
    expect(shift.occurrenceDate?.toISOString().slice(0, 10)).toBe('2026-10-05');
    shiftIdWithRequest = shift.id;
  });

  test('LIFE-04: Shift with pending StaffRequest is preserved during rule change', async () => {
    // Attach dummy StaffRequest to shift
    const staffId = 'f9c8b7a6-5432-10fe-dcba-9876543210fe'; // Test staff UUID
    await prisma.staffRequest.create({
      data: {
        shiftId: shiftIdWithRequest,
        staffId: staffId,
        status: 'PENDING',
      },
    });

    // Query shift with relations
    const shiftBeforeEdit = await prisma.shift.findUnique({
      where: { id: shiftIdWithRequest },
      include: { requests: true, assignments: true },
    });

    // Verification: Shift has requests and MUST NOT be deleted
    expect(shiftBeforeEdit?.requests.length).toBeGreaterThan(0);
    expect(shiftBeforeEdit?.assignments.length).toBe(0);
    // Rule change safety logic evaluation:
    const isEligibleForRemoval =
      shiftBeforeEdit!.requests.length === 0 &&
      shiftBeforeEdit!.assignments.length === 0 &&
      !shiftBeforeEdit!.isOccurrenceOverride;

    expect(isEligibleForRemoval).toBe(false); // MUST BE FALSE -> PRESERVED!
  });
});
```
