/*
  Warnings:

  - You are about to drop the `InfrastructureHealth` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AdminUserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "SettingValueType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON');

-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('PENDING_ONBOARDING', 'PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "FitnessStatus" AS ENUM ('FIT_FOR_WORK', 'PENDING_ASSESSMENT', 'RESTRICTED_DUTY');

-- CreateEnum
CREATE TYPE "BankVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReferenceVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ReviewAction" AS ENUM ('APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StaffRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ShiftAssignmentStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'NO_SHOW', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AttendanceState" AS ENUM ('NOT_STARTED', 'ON_THE_WAY', 'REACHED_LOCATION', 'JOB_STARTED', 'ON_BREAK', 'JOB_ENDED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PENDING', 'PRESENT', 'LATE', 'EARLY_DEPARTURE', 'ABSENT', 'FLAGGED');

-- CreateEnum
CREATE TYPE "AttendanceEventType" AS ENUM ('START_JOURNEY', 'ON_THE_WAY', 'REACHED_LOCATION', 'START_JOB', 'START_BREAK', 'END_BREAK', 'END_JOB', 'JOB_COMPLETED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SHIFT_INVITE', 'APPLICATION_APPROVED', 'APPLICATION_REJECTED', 'SHIFT_REMINDER', 'ANNOUNCEMENT', 'SUPPORT_REPLY');

-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('PAYROLL', 'SHIFT_ISSUE', 'COMPLIANCE', 'APP_BUG', 'OTHER');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- DropTable
DROP TABLE "InfrastructureHealth";

-- CreateTable
CREATE TABLE "admin_users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "status" "AdminUserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "admin_user_roles" (
    "admin_user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_user_roles_pkey" PRIMARY KEY ("admin_user_id","role_id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" UUID NOT NULL,
    "user_type" "UserType" NOT NULL,
    "admin_user_id" UUID,
    "staff_id" UUID,
    "refresh_token_hash" VARCHAR(255) NOT NULL,
    "device_info" TEXT,
    "ip_address" VARCHAR(45),
    "expires_at" TIMESTAMPTZ NOT NULL,
    "revoked_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "value_type" "SettingValueType" NOT NULL DEFAULT 'STRING',
    "description" TEXT,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" UUID,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" UUID NOT NULL,
    "worker_code" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "status" "StaffStatus" NOT NULL DEFAULT 'PENDING_ONBOARDING',
    "avatar_url" TEXT,
    "primary_role_id" UUID,
    "push_token" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_details" (
    "id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "gender" "Gender" NOT NULL,
    "nationality" VARCHAR(100),
    "ni_number" VARCHAR(20),
    "utr_number" VARCHAR(20),
    "address_line_1" TEXT NOT NULL,
    "address_line_2" TEXT,
    "city" VARCHAR(100) NOT NULL,
    "postcode" VARCHAR(20) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "personal_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_information" (
    "id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "fitness_status" "FitnessStatus" NOT NULL,
    "blood_group" VARCHAR(10),
    "emergency_contact_name" VARCHAR(150),
    "emergency_contact_phone" VARCHAR(20),
    "allergies_medical_notes" TEXT,
    "disability_accommodations" TEXT,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_details" (
    "id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "account_holder_name" VARCHAR(150) NOT NULL,
    "bank_name" VARCHAR(100) NOT NULL,
    "sort_code_encrypted" TEXT NOT NULL,
    "account_number_encrypted" TEXT NOT NULL,
    "verification_status" "BankVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "next_of_kin" (
    "id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "relationship" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255),
    "address" TEXT,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "next_of_kin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qualifications" (
    "id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "highest_education_level" VARCHAR(100),
    "years_of_experience" INTEGER,
    "specialized_certifications" TEXT,
    "issue_date" DATE,
    "expiry_date" DATE,
    "certificate_document_url" TEXT,

    CONSTRAINT "qualifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employment_references" (
    "id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "company_name" VARCHAR(150) NOT NULL,
    "supervisor_name" VARCHAR(150) NOT NULL,
    "supervisor_phone" VARCHAR(20) NOT NULL,
    "supervisor_email" VARCHAR(255),
    "job_title" VARCHAR(100),
    "verification_status" "ReferenceVerificationStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "employment_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_contracts" (
    "id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "contract_version" VARCHAR(50) NOT NULL,
    "signed_digitally" BOOLEAN NOT NULL DEFAULT false,
    "signed_at" TIMESTAMPTZ,
    "signature_svg_or_url" TEXT,
    "pdf_copy_url" TEXT,

    CONSTRAINT "staff_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_types" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "document_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_documents" (
    "id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "document_type_id" UUID NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "expiry_date" DATE,
    "uploaded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_reviews" (
    "id" UUID NOT NULL,
    "staff_document_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "action" "ReviewAction" NOT NULL,
    "rejection_reason" TEXT,
    "reviewed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_documents" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "file_url" TEXT NOT NULL,
    "version" VARCHAR(50) NOT NULL DEFAULT '1.0',
    "is_mandatory_acknowledgement" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,

    CONSTRAINT "policy_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "address_line" TEXT NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "postcode" VARCHAR(20) NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "geofence_radius_meters" INTEGER NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_roles" (
    "id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "job_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" UUID NOT NULL,
    "shift_code" VARCHAR(20) NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "job_role_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "shift_date" DATE NOT NULL,
    "start_time" TIMESTAMPTZ NOT NULL,
    "end_time" TIMESTAMPTZ NOT NULL,
    "break_duration_minutes" INTEGER NOT NULL,
    "pay_rate_hourly" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "required_workers" INTEGER NOT NULL,
    "description" TEXT,
    "requirements" TEXT,
    "admin_notes" TEXT,
    "status" "ShiftStatus" NOT NULL DEFAULT 'PUBLISHED',
    "created_by_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_requests" (
    "id" UUID NOT NULL,
    "shift_id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "status" "StaffRequestStatus" NOT NULL DEFAULT 'PENDING',
    "applied_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "rejection_reason" TEXT,

    CONSTRAINT "staff_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_assignments" (
    "id" UUID NOT NULL,
    "shift_id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "status" "ShiftAssignmentStatus" NOT NULL DEFAULT 'CONFIRMED',
    "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shift_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" UUID NOT NULL,
    "shift_assignment_id" UUID NOT NULL,
    "shift_id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "current_state" "AttendanceState" NOT NULL DEFAULT 'NOT_STARTED',
    "scheduled_start_time" TIMESTAMPTZ NOT NULL,
    "scheduled_end_time" TIMESTAMPTZ NOT NULL,
    "actual_start_time" TIMESTAMPTZ,
    "actual_end_time" TIMESTAMPTZ,
    "gps_verified" BOOLEAN NOT NULL DEFAULT false,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_events" (
    "id" UUID NOT NULL,
    "attendance_record_id" UUID NOT NULL,
    "event_type" "AttendanceEventType" NOT NULL,
    "recorded_at" TIMESTAMPTZ NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "gps_accuracy" DOUBLE PRECISION NOT NULL,
    "distance_from_location" DOUBLE PRECISION NOT NULL,
    "geofence_passed" BOOLEAN NOT NULL,
    "is_mock_location" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "break_records" (
    "id" UUID NOT NULL,
    "attendance_record_id" UUID NOT NULL,
    "started_at" TIMESTAMPTZ NOT NULL,
    "ended_at" TIMESTAMPTZ,
    "duration_minutes" INTEGER,

    CONSTRAINT "break_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "notification_type" "NotificationType" NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "published_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" UUID NOT NULL,
    "shift_id" UUID,
    "sender_type" "SenderType" NOT NULL,
    "sender_staff_id" UUID,
    "sender_admin_id" UUID,
    "recipient_staff_id" UUID,
    "message_text" TEXT NOT NULL,
    "sent_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" UUID NOT NULL,
    "ticket_code" VARCHAR(20) NOT NULL,
    "staff_id" UUID NOT NULL,
    "subject" VARCHAR(200) NOT NULL,
    "category" "TicketCategory" NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_messages" (
    "id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "sender_type" "SenderType" NOT NULL,
    "sender_staff_id" UUID,
    "sender_admin_id" UUID,
    "message_text" TEXT NOT NULL,
    "sent_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_admin_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "admin_users_status_idx" ON "admin_users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "permissions_module_idx" ON "permissions"("module");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_refresh_token_hash_key" ON "user_sessions"("refresh_token_hash");

-- CreateIndex
CREATE INDEX "user_sessions_admin_user_id_idx" ON "user_sessions"("admin_user_id");

-- CreateIndex
CREATE INDEX "user_sessions_staff_id_idx" ON "user_sessions"("staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_worker_code_key" ON "staff"("worker_code");

-- CreateIndex
CREATE UNIQUE INDEX "staff_email_key" ON "staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "staff_phone_key" ON "staff"("phone");

-- CreateIndex
CREATE INDEX "staff_status_idx" ON "staff"("status");

-- CreateIndex
CREATE UNIQUE INDEX "personal_details_staff_id_key" ON "personal_details"("staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "health_information_staff_id_key" ON "health_information"("staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "bank_details_staff_id_key" ON "bank_details"("staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "next_of_kin_staff_id_key" ON "next_of_kin"("staff_id");

-- CreateIndex
CREATE INDEX "qualifications_staff_id_idx" ON "qualifications"("staff_id");

-- CreateIndex
CREATE INDEX "employment_references_staff_id_idx" ON "employment_references"("staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_contracts_staff_id_key" ON "staff_contracts"("staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_types_code_key" ON "document_types"("code");

-- CreateIndex
CREATE INDEX "staff_documents_staff_id_idx" ON "staff_documents"("staff_id");

-- CreateIndex
CREATE INDEX "staff_documents_document_type_id_idx" ON "staff_documents"("document_type_id");

-- CreateIndex
CREATE INDEX "staff_documents_status_idx" ON "staff_documents"("status");

-- CreateIndex
CREATE INDEX "document_reviews_staff_document_id_idx" ON "document_reviews"("staff_document_id");

-- CreateIndex
CREATE INDEX "document_reviews_reviewer_id_idx" ON "document_reviews"("reviewer_id");

-- CreateIndex
CREATE INDEX "policy_documents_category_idx" ON "policy_documents"("category");

-- CreateIndex
CREATE UNIQUE INDEX "job_roles_title_key" ON "job_roles"("title");

-- CreateIndex
CREATE UNIQUE INDEX "shifts_shift_code_key" ON "shifts"("shift_code");

-- CreateIndex
CREATE INDEX "shifts_shift_date_idx" ON "shifts"("shift_date");

-- CreateIndex
CREATE INDEX "shifts_status_idx" ON "shifts"("status");

-- CreateIndex
CREATE INDEX "shifts_job_role_id_idx" ON "shifts"("job_role_id");

-- CreateIndex
CREATE INDEX "shifts_location_id_idx" ON "shifts"("location_id");

-- CreateIndex
CREATE INDEX "staff_requests_shift_id_idx" ON "staff_requests"("shift_id");

-- CreateIndex
CREATE INDEX "staff_requests_staff_id_idx" ON "staff_requests"("staff_id");

-- CreateIndex
CREATE INDEX "staff_requests_status_idx" ON "staff_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "staff_requests_shift_id_staff_id_key" ON "staff_requests"("shift_id", "staff_id");

-- CreateIndex
CREATE INDEX "shift_assignments_shift_id_idx" ON "shift_assignments"("shift_id");

-- CreateIndex
CREATE INDEX "shift_assignments_staff_id_idx" ON "shift_assignments"("staff_id");

-- CreateIndex
CREATE INDEX "shift_assignments_status_idx" ON "shift_assignments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "shift_assignments_shift_id_staff_id_key" ON "shift_assignments"("shift_id", "staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_shift_assignment_id_key" ON "attendance_records"("shift_assignment_id");

-- CreateIndex
CREATE INDEX "attendance_records_shift_id_idx" ON "attendance_records"("shift_id");

-- CreateIndex
CREATE INDEX "attendance_records_staff_id_idx" ON "attendance_records"("staff_id");

-- CreateIndex
CREATE INDEX "attendance_records_status_idx" ON "attendance_records"("status");

-- CreateIndex
CREATE INDEX "attendance_records_current_state_idx" ON "attendance_records"("current_state");

-- CreateIndex
CREATE INDEX "attendance_events_attendance_record_id_idx" ON "attendance_events"("attendance_record_id");

-- CreateIndex
CREATE INDEX "attendance_events_recorded_at_idx" ON "attendance_events"("recorded_at");

-- CreateIndex
CREATE INDEX "break_records_attendance_record_id_idx" ON "break_records"("attendance_record_id");

-- CreateIndex
CREATE INDEX "notifications_staff_id_idx" ON "notifications"("staff_id");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "announcements_author_id_idx" ON "announcements"("author_id");

-- CreateIndex
CREATE INDEX "announcements_published_at_idx" ON "announcements"("published_at");

-- CreateIndex
CREATE INDEX "chat_messages_shift_id_idx" ON "chat_messages"("shift_id");

-- CreateIndex
CREATE INDEX "chat_messages_sender_staff_id_idx" ON "chat_messages"("sender_staff_id");

-- CreateIndex
CREATE INDEX "chat_messages_sender_admin_id_idx" ON "chat_messages"("sender_admin_id");

-- CreateIndex
CREATE INDEX "chat_messages_recipient_staff_id_idx" ON "chat_messages"("recipient_staff_id");

-- CreateIndex
CREATE INDEX "chat_messages_sent_at_idx" ON "chat_messages"("sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_ticket_code_key" ON "support_tickets"("ticket_code");

-- CreateIndex
CREATE INDEX "support_tickets_staff_id_idx" ON "support_tickets"("staff_id");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_category_idx" ON "support_tickets"("category");

-- CreateIndex
CREATE INDEX "ticket_messages_ticket_id_idx" ON "ticket_messages"("ticket_id");

-- CreateIndex
CREATE INDEX "ticket_messages_sender_staff_id_idx" ON "ticket_messages"("sender_staff_id");

-- CreateIndex
CREATE INDEX "ticket_messages_sender_admin_id_idx" ON "ticket_messages"("sender_admin_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_admin_id_idx" ON "audit_logs"("actor_admin_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_user_roles" ADD CONSTRAINT "admin_user_roles_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_user_roles" ADD CONSTRAINT "admin_user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_primary_role_id_fkey" FOREIGN KEY ("primary_role_id") REFERENCES "job_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_details" ADD CONSTRAINT "personal_details_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_information" ADD CONSTRAINT "health_information_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_details" ADD CONSTRAINT "bank_details_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "next_of_kin" ADD CONSTRAINT "next_of_kin_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qualifications" ADD CONSTRAINT "qualifications_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_references" ADD CONSTRAINT "employment_references_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_contracts" ADD CONSTRAINT "staff_contracts_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_documents" ADD CONSTRAINT "staff_documents_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_documents" ADD CONSTRAINT "staff_documents_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "document_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_reviews" ADD CONSTRAINT "document_reviews_staff_document_id_fkey" FOREIGN KEY ("staff_document_id") REFERENCES "staff_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_reviews" ADD CONSTRAINT "document_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_documents" ADD CONSTRAINT "policy_documents_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_job_role_id_fkey" FOREIGN KEY ("job_role_id") REFERENCES "job_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_requests" ADD CONSTRAINT "staff_requests_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_requests" ADD CONSTRAINT "staff_requests_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_requests" ADD CONSTRAINT "staff_requests_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_shift_assignment_id_fkey" FOREIGN KEY ("shift_assignment_id") REFERENCES "shift_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_events" ADD CONSTRAINT "attendance_events_attendance_record_id_fkey" FOREIGN KEY ("attendance_record_id") REFERENCES "attendance_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "break_records" ADD CONSTRAINT "break_records_attendance_record_id_fkey" FOREIGN KEY ("attendance_record_id") REFERENCES "attendance_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_staff_id_fkey" FOREIGN KEY ("sender_staff_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_admin_id_fkey" FOREIGN KEY ("sender_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_recipient_staff_id_fkey" FOREIGN KEY ("recipient_staff_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_sender_staff_id_fkey" FOREIGN KEY ("sender_staff_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_sender_admin_id_fkey" FOREIGN KEY ("sender_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_admin_id_fkey" FOREIGN KEY ("actor_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
