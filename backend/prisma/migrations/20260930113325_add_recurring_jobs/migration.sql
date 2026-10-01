/*
  Warnings:

  - A unique constraint covering the columns `[recurring_job_id,occurrence_date]` on the table `shifts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "RecurringJobStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "shifts" ADD COLUMN     "is_occurrence_override" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "occurrence_date" DATE,
ADD COLUMN     "recurring_job_id" UUID;

-- CreateTable
CREATE TABLE "recurring_jobs" (
    "id" UUID NOT NULL,
    "recurring_job_code" VARCHAR(20) NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "job_role_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "timezone" VARCHAR(50),
    "start_time_of_day" VARCHAR(5) NOT NULL,
    "end_time_of_day" VARCHAR(5) NOT NULL,
    "break_duration_minutes" INTEGER NOT NULL,
    "pay_rate_hourly" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "required_workers" INTEGER NOT NULL,
    "description" TEXT,
    "requirements" TEXT,
    "admin_notes" TEXT,
    "status" "RecurringJobStatus" NOT NULL DEFAULT 'DRAFT',
    "recurrence_frequency" "RecurrenceFrequency" NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "by_weekdays" INTEGER[],
    "by_month_day" INTEGER,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "last_generated_until" DATE,
    "created_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "recurring_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recurring_jobs_recurring_job_code_key" ON "recurring_jobs"("recurring_job_code");

-- CreateIndex
CREATE INDEX "recurring_jobs_status_idx" ON "recurring_jobs"("status");

-- CreateIndex
CREATE INDEX "recurring_jobs_location_id_idx" ON "recurring_jobs"("location_id");

-- CreateIndex
CREATE INDEX "recurring_jobs_job_role_id_idx" ON "recurring_jobs"("job_role_id");

-- CreateIndex
CREATE INDEX "recurring_jobs_start_date_end_date_idx" ON "recurring_jobs"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "shifts_recurring_job_id_idx" ON "shifts"("recurring_job_id");

-- CreateIndex
CREATE UNIQUE INDEX "shifts_recurring_job_id_occurrence_date_key" ON "shifts"("recurring_job_id", "occurrence_date");

-- AddForeignKey
ALTER TABLE "recurring_jobs" ADD CONSTRAINT "recurring_jobs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_jobs" ADD CONSTRAINT "recurring_jobs_job_role_id_fkey" FOREIGN KEY ("job_role_id") REFERENCES "job_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_jobs" ADD CONSTRAINT "recurring_jobs_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_recurring_job_id_fkey" FOREIGN KEY ("recurring_job_id") REFERENCES "recurring_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
