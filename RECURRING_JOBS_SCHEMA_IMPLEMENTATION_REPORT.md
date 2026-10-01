# USAFI WORKFORCE MANAGEMENT PLATFORM
## RECURRING JOBS — PRISMA SCHEMA IMPLEMENTATION REPORT (PHASE 1)

**Document Version:** 1.0.0  
**Phase Status:** Phase 1 (Prisma Schema Implementation) Complete — No Migration Created  
**Target File:** `backend/prisma/schema.prisma`  
**Author:** Principal Software Architect  
**Date:** September 30, 2026  

---

## 1. PREVIOUS SCHEMA STATE

Prior to Phase 1, `backend/prisma/schema.prisma` defined 28 models and 17 enums supporting Phases 1–11 (Single Shift management, Staff management, Document reviews, Attendance tracking, Support ticketing, Notifications, and Audit logging). `Shift` existed as an atomic model without any recurrence fields or relationships to parent job templates.

---

## 2. EXACT SCHEMA ADDITIONS

### A. New Enums
1. **`RecurringJobStatus`**:
   ```prisma
   enum RecurringJobStatus {
     DRAFT
     ACTIVE
     PAUSED
     COMPLETED
     CANCELLED
   }
   ```
2. **`RecurrenceFrequency`**:
   ```prisma
   enum RecurrenceFrequency {
     DAILY
     WEEKLY
     MONTHLY
   }
   ```

### B. New Model: `RecurringJob`
```prisma
/// Master template and schedule rule for recurring job instances
model RecurringJob {
  id                   String              @id @default(uuid()) @db.Uuid
  recurringJobCode     String              @unique @map("recurring_job_code") @db.VarChar(20)
  title                String              @db.VarChar(150)
  jobRoleId            String              @map("job_role_id") @db.Uuid
  locationId           String              @map("location_id") @db.Uuid
  timezone             String?             @db.VarChar(50)
  startTimeOfDay       String              @map("start_time_of_day") @db.VarChar(5)
  endTimeOfDay         String              @map("end_time_of_day") @db.VarChar(5)
  breakDurationMinutes Int                 @map("break_duration_minutes")
  payRateHourly        Decimal             @map("pay_rate_hourly") @db.Decimal(10, 2)
  currency             String              @db.VarChar(3)
  requiredWorkers      Int                 @map("required_workers")
  description          String?
  requirements         String?
  adminNotes           String?             @map("admin_notes")
  status               RecurringJobStatus  @default(DRAFT)
  recurrenceFrequency  RecurrenceFrequency @map("recurrence_frequency")
  interval             Int                 @default(1)
  byWeekdays           Int[]               @map("by_weekdays")
  byMonthDay           Int?                @map("by_month_day")
  startDate            DateTime            @map("start_date") @db.Date
  endDate              DateTime?           @map("end_date") @db.Date
  lastGeneratedUntil   DateTime?           @map("last_generated_until") @db.Date
  createdById          String?             @map("created_by_id") @db.Uuid
  createdAt            DateTime            @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt            DateTime            @updatedAt @map("updated_at") @db.Timestamptz(6)

  createdBy            AdminUser?          @relation("RecurringJobCreatedByAdmin", fields: [createdById], references: [id])
  jobRole              JobRole             @relation(fields: [jobRoleId], references: [id])
  location             Location            @relation(fields: [locationId], references: [id])
  shifts               Shift[]

  @@index([status])
  @@index([locationId])
  @@index([jobRoleId])
  @@index([startDate, endDate])
  @@map("recurring_jobs")
}
```

---

## 3. EXACT MODEL MODIFICATIONS & RELATIONS

### A. Modifications to `Shift`
Added ONLY the 3 approved fields, 1 relation, 1 composite unique constraint, and 1 index:
```prisma
model Shift {
  ...
  recurringJobId       String?            @map("recurring_job_id") @db.Uuid
  occurrenceDate       DateTime?          @map("occurrence_date") @db.Date
  isOccurrenceOverride Boolean            @default(false) @map("is_occurrence_override")
  ...
  recurringJob         RecurringJob?      @relation(fields: [recurringJobId], references: [id], onDelete: SetNull)
  ...
  @@unique([recurringJobId, occurrenceDate])
  @@index([recurringJobId])
  ...
}
```

### B. Relation-Side Additions on Existing Models
1. **`AdminUser`**: Added `createdRecurringJobs RecurringJob[] @relation("RecurringJobCreatedByAdmin")`
2. **`Location`**: Added `recurringJobs RecurringJob[]`
3. **`JobRole`**: Added `recurringJobs RecurringJob[]`

---

## 4. CONSTRAINTS & INDEXES SUMMARY

- **Unique Constraints:**
  - `RecurringJob.recurringJobCode` (`@unique`, `@db.VarChar(20)`)
  - `Shift` Composite Constraint: `@@unique([recurringJobId, occurrenceDate])`
- **Database Indexes:**
  - `recurring_jobs`: `@@index([status])`, `@@index([locationId])`, `@@index([jobRoleId])`, `@@index([startDate, endDate])`
  - `shifts`: `@@index([recurringJobId])`

---

## 5. DELETE BEHAVIOR

- `Shift` $\rightarrow$ `RecurringJob`: `onDelete: SetNull`. If a `RecurringJob` record is purged or soft-deleted, existing generated `Shift` instances retain their full records with `recurringJobId = NULL`.
- No database cascades were added that could delete `StaffRequest`, `ShiftAssignment`, `AttendanceRecord`, or historical `Shift` entries.

---

## 6. VALIDATION COMMANDS EXECUTION & RESULTS

| Validation Command | Scope / Context | Result | Exit Code |
| :--- | :--- | :--- | :--- |
| `npx prisma format` | Standardizes Prisma formatting | PASS — Formatted `prisma/schema.prisma` in 82ms | `0` |
| `npx prisma validate` | Validates Prisma schema syntax & relation constraints | PASS — "The schema at prisma/schema.prisma is valid 🚀" | `0` |
| `npx prisma generate` | Generates TypeScript client in `node_modules/@prisma/client` | PASS — Generated Prisma Client (v6.4.0) in 313ms | `0` |
| `npx tsc --noEmit` | TypeScript compiler static typecheck | PASS — 0 errors found across entire backend codebase | `0` |

---

## 7. GIT DIFF SUMMARY

- `backend/prisma/schema.prisma`:
  - Added `RecurringJobStatus` enum (5 options).
  - Added `RecurrenceFrequency` enum (3 options).
  - Added `RecurringJob` model definition.
  - Added `createdRecurringJobs` back-relation on `AdminUser`.
  - Added `recurringJobs` back-relation on `Location`.
  - Added `recurringJobs` back-relation on `JobRole`.
  - Added `recurringJobId`, `occurrenceDate`, `isOccurrenceOverride`, `recurringJob` relation, `@@unique([recurringJobId, occurrenceDate])`, and `@@index([recurringJobId])` on `Shift`.
- No unexpected or unrelated schema changes were detected.

---

## 8. STRICT PHASE 1 COMPLIANCE CONFIRMATIONS

- **PostgreSQL Database Modified:** **NO** (Database was not touched).
- **Prisma Migration Created (`prisma migrate`):** **NO** (No migration files were created or applied).
- **Backend Source Code Modified (`src/`):** **NO** (Zero application code modified).
- **Packages Installed:** **NO** (Zero npm packages installed; `package.json` untouched).

---

## 9. DECLARATION STATEMENT

"Recurring Jobs Prisma schema implementation is complete, but database migration has NOT yet been created or applied."
