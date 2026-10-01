import { Prisma, RecurringJob, RecurringJobStatus, ShiftStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { ApiError } from '../utils/apiError';
import { recurrenceCalculator } from './recurrence-calculator.service';
import { recurringJobRepository } from '../repositories/recurring-job.repository';
import {
  OccurrenceGenerationOptions,
  OccurrenceGenerationResult,
  GeneratedShiftMetadata,
} from '../types/recurrence.types';
import { toCalendarDateString } from '../validators/recurrence.validator';
import {
  parseTimeToHoursMinutes,
  localDateTimeToUtc,
  getTodayCalendarDateInTimezone,
  generateShiftCode,
} from '../utils/timezone-date';

export class OccurrenceGeneratorService {
  /**
   * Generates shift occurrences for a single RecurringJob.
   *
   * Enforces:
   * - ACTIVE status requirement (DRAFT/PAUSED/CANCELLED/COMPLETED produce 0 shifts)
   * - 30-day rolling window horizon (bounded by RecurringJob.endDate)
   * - No historical generation (starts from max(currentDate, startDate))
   * - 3-tier Timezone conversion (Job -> SystemSettings -> UTC)
   * - Exact date alignment (shiftDate == occurrenceDate)
   * - Overnight shift timestamp calculation
   * - Length-safe shiftCode generation (RJXXXX-YYMMDD <= 20 chars)
   * - Direct copy of template attributes including requiredWorkers, pay rate, role, location
   * - Idempotent database insertion with (recurringJobId, occurrenceDate) unique constraint
   * - Transactional lastGeneratedUntil advancement
   */
  async generateForJob(
    jobOrId: string | RecurringJob,
    options: OccurrenceGenerationOptions = {}
  ): Promise<OccurrenceGenerationResult> {
    const job =
      typeof jobOrId === 'string'
        ? await recurringJobRepository.findById(jobOrId, options.tx)
        : jobOrId;

    if (!job) {
      throw ApiError.notFound(`RecurringJob with ID '${typeof jobOrId === 'string' ? jobOrId : 'unknown'}' not found`);
    }

    // 1. Status Check: Generation is only permitted for ACTIVE status
    if (job.status !== RecurringJobStatus.ACTIVE) {
      return {
        recurringJobId: job.id,
        recurringJobCode: job.recurringJobCode,
        status: job.status,
        generatedCount: 0,
        horizonEndDate: null,
        lastGeneratedUntil: job.lastGeneratedUntil ? toCalendarDateString(job.lastGeneratedUntil) : null,
        createdShiftCodes: [],
        shifts: [],
        skippedReason: `JOB_NOT_ACTIVE_${job.status}`,
      };
    }

    // 2. Resolve Timezone
    const systemTz = options.systemTimezone ?? (await recurringJobRepository.getDefaultPlatformTimezone(options.tx));
    const resolvedTz = recurrenceCalculator.resolveTimezone(job.timezone, systemTz, 'UTC');

    // 3. Resolve Generation Window
    const windowDays = options.generationWindowDays ?? (await recurringJobRepository.getGenerationWindowDays(options.tx));

    // Reference current date in resolved timezone
    const currentDateStr = options.currentDate
      ? toCalendarDateString(options.currentDate)!
      : getTodayCalendarDateInTimezone(resolvedTz);
    const currentDateParts = recurrenceCalculator.parseDateString(currentDateStr);

    const startDateStr = toCalendarDateString(job.startDate)!;
    const startDateParts = recurrenceCalculator.parseDateString(startDateStr);

    // Rule: Start generation from max(currentDate, startDate)
    const effectiveStartParts =
      recurrenceCalculator.compareDates(currentDateParts, startDateParts) > 0
        ? currentDateParts
        : startDateParts;
    const effectiveStartStr = recurrenceCalculator.formatDate(effectiveStartParts);

    // Rule: Horizon end is min(currentDate + windowDays, endDate)
    const windowEndParts = recurrenceCalculator.addDays(currentDateParts, windowDays);
    const windowEndStr = recurrenceCalculator.formatDate(windowEndParts);

    let effectiveHorizonEndStr = windowEndStr;
    if (job.endDate) {
      const jobEndStr = toCalendarDateString(job.endDate)!;
      const jobEndParts = recurrenceCalculator.parseDateString(jobEndStr);
      if (recurrenceCalculator.compareDates(windowEndParts, jobEndParts) > 0) {
        effectiveHorizonEndStr = jobEndStr;
      }
    }

    const effectiveHorizonEndParts = recurrenceCalculator.parseDateString(effectiveHorizonEndStr);

    // If effective start date is past effective horizon end date, no shifts to generate
    if (recurrenceCalculator.compareDates(effectiveStartParts, effectiveHorizonEndParts) > 0) {
      return {
        recurringJobId: job.id,
        recurringJobCode: job.recurringJobCode,
        status: job.status,
        generatedCount: 0,
        horizonEndDate: effectiveHorizonEndStr,
        lastGeneratedUntil: job.lastGeneratedUntil ? toCalendarDateString(job.lastGeneratedUntil) : null,
        createdShiftCodes: [],
        shifts: [],
        skippedReason: 'WINDOW_START_PAST_HORIZON_END',
      };
    }

    // 4. Calculate Occurrence Dates via Pure Recurrence Calculator (Reusing Phase 3A)
    const occurrenceDateStrings = recurrenceCalculator.calculateOccurrences(
      {
        frequency: job.recurrenceFrequency,
        interval: job.interval,
        startDate: job.startDate,
        endDate: job.endDate,
        byWeekdays: job.byWeekdays,
        byMonthDay: job.byMonthDay,
        timezone: resolvedTz,
      },
      {
        windowStartDate: effectiveStartStr,
        windowEndDate: effectiveHorizonEndStr,
      }
    );

    // 5. Parse Times of Day
    const { hours: startH, minutes: startMin } = parseTimeToHoursMinutes(job.startTimeOfDay);
    const { hours: endH, minutes: endMin } = parseTimeToHoursMinutes(job.endTimeOfDay);
    const isOvernight = job.endTimeOfDay <= job.startTimeOfDay;

    // 6. Map to Shift entities
    const shiftsToCreate: Prisma.ShiftCreateManyInput[] = [];
    const generatedMetadata: GeneratedShiftMetadata[] = [];
    const createdShiftCodes: string[] = [];

    for (const occurrenceDateStr of occurrenceDateStrings) {
      const occurrenceParts = recurrenceCalculator.parseDateString(occurrenceDateStr);

      // Local start -> UTC
      const startTimeUtc = localDateTimeToUtc(
        occurrenceParts.year,
        occurrenceParts.month,
        occurrenceParts.day,
        startH,
        startMin,
        resolvedTz
      );

      // Local end -> UTC (if overnight, increment local day)
      let endYear = occurrenceParts.year;
      let endMonth = occurrenceParts.month;
      let endDay = occurrenceParts.day;
      if (isOvernight) {
        const nextDay = recurrenceCalculator.addDays(occurrenceParts, 1);
        endYear = nextDay.year;
        endMonth = nextDay.month;
        endDay = nextDay.day;
      }

      const endTimeUtc = localDateTimeToUtc(endYear, endMonth, endDay, endH, endMin, resolvedTz);

      // Exact date alignment: occurrenceDate === shiftDate (UTC midnight)
      const occurrenceDateUtc = new Date(Date.UTC(occurrenceParts.year, occurrenceParts.month - 1, occurrenceParts.day));
      const shiftDateUtc = occurrenceDateUtc;

      const shiftCode = generateShiftCode(job.recurringJobCode, occurrenceDateStr);
      createdShiftCodes.push(shiftCode);

      const payRateDecimal = new Prisma.Decimal(job.payRateHourly.toString());

      shiftsToCreate.push({
        shiftCode,
        title: job.title,
        jobRoleId: job.jobRoleId,
        locationId: job.locationId,
        shiftDate: shiftDateUtc,
        startTime: startTimeUtc,
        endTime: endTimeUtc,
        breakDurationMinutes: job.breakDurationMinutes,
        payRateHourly: payRateDecimal,
        currency: job.currency,
        requiredWorkers: job.requiredWorkers,
        description: job.description,
        requirements: job.requirements,
        adminNotes: job.adminNotes,
        status: ShiftStatus.PUBLISHED,
        recurringJobId: job.id,
        occurrenceDate: occurrenceDateUtc,
        isOccurrenceOverride: false,
        createdById: job.createdById,
      });

      generatedMetadata.push({
        shiftCode,
        occurrenceDate: occurrenceDateStr,
        shiftDate: occurrenceDateStr,
        startTime: startTimeUtc,
        endTime: endTimeUtc,
        requiredWorkers: job.requiredWorkers,
        payRateHourly: Number(job.payRateHourly),
        currency: job.currency,
      });
    }

    // 7. Transactional Execution
    const horizonEndDateObj = new Date(
      Date.UTC(effectiveHorizonEndParts.year, effectiveHorizonEndParts.month - 1, effectiveHorizonEndParts.day)
    );

    let insertedCount = 0;

    const executeTransaction = async (tx: Prisma.TransactionClient) => {
      // Create missing shifts idempotently using @@unique([recurringJobId, occurrenceDate])
      if (shiftsToCreate.length > 0) {
        insertedCount = await recurringJobRepository.createShiftOccurrences(shiftsToCreate, tx);
      }

      // Update lastGeneratedUntil to effectiveHorizonEnd
      await recurringJobRepository.updateLastGeneratedUntil(job.id, horizonEndDateObj, tx);
    };

    if (options.tx) {
      await executeTransaction(options.tx);
    } else {
      await prisma.$transaction(async (tx) => {
        await executeTransaction(tx);
      });
    }

    return {
      recurringJobId: job.id,
      recurringJobCode: job.recurringJobCode,
      status: job.status,
      generatedCount: insertedCount,
      horizonEndDate: effectiveHorizonEndStr,
      lastGeneratedUntil: effectiveHorizonEndStr,
      createdShiftCodes,
      shifts: generatedMetadata,
    };
  }

  /**
   * Generates occurrences for all currently active recurring jobs.
   */
  async generateForAllActiveJobs(options: OccurrenceGenerationOptions = {}): Promise<OccurrenceGenerationResult[]> {
    const activeJobs = await recurringJobRepository.findActiveJobs(options.tx);
    const results: OccurrenceGenerationResult[] = [];

    for (const job of activeJobs) {
      const res = await this.generateForJob(job, options);
      results.push(res);
    }

    return results;
  }
}

export const occurrenceGenerator = new OccurrenceGeneratorService();
