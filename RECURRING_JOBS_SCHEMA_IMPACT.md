# USAFI WORKFORCE MANAGEMENT PLATFORM
## RECURRING JOBS — DATABASE SCHEMA IMPACT REPORT

**Document Version:** 1.2.0 (Final Approval Correction Pass)  
**Status:** Architecture Correction Complete — Ready for Final Approval Audit  
**Target ORM:** Prisma ORM / PostgreSQL 17  
**Author:** Principal Software Architect  
**Date:** September 30, 2026  

---

## 1. OVERVIEW & CLASSIFICATION SUMMARY

This document details the exact, isolated database schema impact of the Recurring Jobs feature on the approved Usafi Prisma schema ([schema.prisma](file:///c:/Users/Dell/Desktop/MSM%20Projects/usafi%20AB/backend/prisma/schema.prisma)).

| Change Classification | Count | Description |
| :--- | :--- | :--- |
| **NEW ENUMS** | 2 | `RecurringJobStatus`, `RecurrenceFrequency` |
| **NEW TABLES / MODELS** | 1 | `recurring_jobs` |
| **MODIFIED TABLES** | 4 | `shifts` (fields/relations/constraints), `admin_users`, `locations`, `job_roles` (back-relations only) |
| **NEW FIELDS ON EXISTING MODELS** | 3 | `Shift.recurringJobId`, `Shift.occurrenceDate`, `Shift.isOccurrenceOverride` |
| **NEW UNIQUE CONSTRAINTS** | 1 | Composite `@@unique([recurringJobId, occurrenceDate])` on `shifts` |
| **NEW INDEXES** | 5 | `recurring_jobs` indexes + `Shift` FK index |
| **UNCHANGED MODELS** | 28 | All operational worker, application, assignment, attendance, document, chat, support, notification, and system models |

---

## 2. PROPOSED PRISMA SCHEMA CHANGES (DIFF FORMAT)

```diff
+ /// Status lifecycle for recurring job templates
+ enum RecurringJobStatus {
+   DRAFT
+   ACTIVE
+   PAUSED
+   COMPLETED
+   CANCELLED
+ }

+ /// Recurrence frequency options for V1
+ enum RecurrenceFrequency {
+   DAILY
+   WEEKLY
+   MONTHLY
+ }

  model AdminUser {
    id                 String           @id @default(uuid()) @db.Uuid
    ...
    createdPolicies    PolicyDocument[] @relation("PolicyCreatedByAdmin")
    createdShifts      Shift[]          @relation("ShiftCreatedByAdmin")
+   createdRecurringJobs RecurringJob[]  @relation("RecurringJobCreatedByAdmin")
    ...
  }

  model Location {
    id                   String  @id @default(uuid()) @db.Uuid
    ...
    shifts               Shift[]
+   recurringJobs        RecurringJob[]
    ...
  }

  model JobRole {
    id          String  @id @default(uuid()) @db.Uuid
    ...
    shifts      Shift[]
+   recurringJobs RecurringJob[]
    ...
  }

+ /// Master template and schedule rule for recurring job instances
+ model RecurringJob {
+   id                   String               @id @default(uuid()) @db.Uuid
+   recurringJobCode     String               @unique @map("recurring_job_code") @db.VarChar(20)
+   title                String               @db.VarChar(150)
+   jobRoleId            String               @map("job_role_id") @db.Uuid
+   locationId           String               @map("location_id") @db.Uuid
+   timezone             String?              @db.VarChar(50)
+   startTimeOfDay       String               @map("start_time_of_day") @db.VarChar(5)
+   endTimeOfDay         String               @map("end_time_of_day") @db.VarChar(5)
+   breakDurationMinutes Int                  @map("break_duration_minutes")
+   payRateHourly        Decimal              @map("pay_rate_hourly") @db.Decimal(10, 2)
+   currency             String               @db.VarChar(3)
+   requiredWorkers      Int                  @map("required_workers")
+   description          String?
+   requirements         String?
+   adminNotes           String?              @map("admin_notes")
+   status               RecurringJobStatus   @default(DRAFT)
+   recurrenceFrequency  RecurrenceFrequency  @map("recurrence_frequency")
+   interval             Int                  @default(1)
+   byWeekdays           Int[]                @map("by_weekdays")
+   byMonthDay           Int?                 @map("by_month_day")
+   startDate            DateTime             @map("start_date") @db.Date
+   endDate              DateTime?            @map("end_date") @db.Date
+   lastGeneratedUntil   DateTime?            @map("last_generated_until") @db.Date
+   createdById          String?              @map("created_by_id") @db.Uuid
+   createdAt            DateTime             @default(now()) @map("created_at") @db.Timestamptz(6)
+   updatedAt            DateTime             @updatedAt @map("updated_at") @db.Timestamptz(6)
+ 
+   createdBy            AdminUser?           @relation("RecurringJobCreatedByAdmin", fields: [createdById], references: [id])
+   jobRole              JobRole              @relation(fields: [jobRoleId], references: [id])
+   location             Location             @relation(fields: [locationId], references: [id])
+   shifts               Shift[]
+ 
+   @@index([status])
+   @@index([locationId])
+   @@index([jobRoleId])
+   @@index([startDate, endDate])
+   @@map("recurring_jobs")
+ }

  model Shift {
    id                   String             @id @default(uuid()) @db.Uuid
    shiftCode            String             @unique @map("shift_code") @db.VarChar(20)
    title                String             @db.VarChar(150)
    jobRoleId            String             @map("job_role_id") @db.Uuid
    locationId           String             @map("location_id") @db.Uuid
    shiftDate            DateTime           @map("shift_date") @db.Date
    startTime            DateTime           @map("start_time") @db.Timestamptz(6)
    endTime              DateTime           @map("end_time") @db.Timestamptz(6)
    breakDurationMinutes Int                @map("break_duration_minutes")
    payRateHourly        Decimal            @map("pay_rate_hourly") @db.Decimal(10, 2)
    currency             String             @db.VarChar(3)
    requiredWorkers      Int                @map("required_workers")
    description          String?
    requirements         String?
    adminNotes           String?            @map("admin_notes")
    status               ShiftStatus        @default(PUBLISHED)
+   recurringJobId       String?            @map("recurring_job_id") @db.Uuid
+   occurrenceDate       DateTime?          @map("occurrence_date") @db.Date
+   isOccurrenceOverride Boolean            @default(false) @map("is_occurrence_override")
    createdById          String?            @map("created_by_id") @db.Uuid
    createdAt            DateTime           @default(now()) @map("created_at") @db.Timestamptz(6)
    attendanceRecords    AttendanceRecord[]
    chatMessages         ChatMessage[]
    assignments          ShiftAssignment[]
    createdBy            AdminUser?         @relation("ShiftCreatedByAdmin", fields: [createdById], references: [id])
    jobRole              JobRole            @relation(fields: [jobRoleId], references: [id])
    location             Location           @relation(fields: [locationId], references: [id])
+   recurringJob         RecurringJob?      @relation(fields: [recurringJobId], references: [id], onDelete: SetNull)
    requests             StaffRequest[]

+   @@unique([recurringJobId, occurrenceDate])
+   @@index([recurringJobId])
    @@index([shiftDate])
    @@index([status])
    @@index([jobRoleId])
    @@index([locationId])
    @@map("shifts")
  }
```

---

## 3. DETAILED FIELD ANALYSIS & CONSTRAINTS

1. **`RecurringJob.status` Default:** Enforces `@default(DRAFT)`. Newly created recurring jobs start in `DRAFT` status and generate zero shifts until explicitly activated.
2. **`RecurringJob.timezone` Nullability:** Optional `String? @db.VarChar(50)`. No hardcoded `@default` on model. Fallback resolves via `SystemSettings` key `DEFAULT_PLATFORM_TIMEZONE` or `'UTC'`. `Location.timezone` is NOT introduced in V1 schema.
3. **`Shift.occurrenceDate` & `Shift.shiftDate` Alignment:** For generated shifts, `Shift.shiftDate` MUST equal `Shift.occurrenceDate`. Overnight shifts starting e.g. 22:00 local retain `occurrenceDate = 2026-10-05` and `shiftDate = 2026-10-05` regardless of UTC end timestamp crossing midnight.
4. **Idempotency Constraint:** `@@unique([recurringJobId, occurrenceDate])` on `shifts`.

---

## 4. MODELS REMAINING STRICTLY UNCHANGED (28 MODELS)

`Staff`, `PersonalDetails`, `HealthInformation`, `BankDetails`, `NextOfKin`, `Qualification`, `EmploymentReference`, `StaffContract`, `DocumentType`, `StaffDocument`, `DocumentReview`, `PolicyDocument`, `StaffRequest`, `ShiftAssignment`, `AttendanceRecord`, `AttendanceEvent`, `BreakRecord`, `Notification`, `Announcement`, `ChatMessage`, `SupportTicket`, `TicketMessage`, `AuditLog`, `SystemSettings`, `UserSession`, `Role`, `Permission`, `RolePermission`, `AdminUserRole`.
