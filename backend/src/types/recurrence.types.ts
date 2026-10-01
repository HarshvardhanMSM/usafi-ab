import { RecurrenceFrequency, RecurringJobStatus, ShiftStatus, Prisma } from '@prisma/client';

export { RecurrenceFrequency, RecurringJobStatus, ShiftStatus };

export interface RecurrenceRuleInput {
  frequency: RecurrenceFrequency | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval?: number;
  startDate: string | Date;
  endDate?: string | Date | null;
  byWeekdays?: number[];
  byMonthDay?: number | null;
  timezone?: string | null;
}

export interface RecurrenceCalculationOptions {
  windowStartDate?: string | Date;
  windowEndDate?: string | Date;
  maxOccurrences?: number;
}

export interface CalendarDateParts {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
}

export interface OccurrenceResult {
  dateString: string; // 'YYYY-MM-DD'
  occurrenceDate: Date; // UTC midnight Date instance
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
}

export interface RecurrenceValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface OccurrenceGenerationOptions {
  currentDate?: string | Date;
  generationWindowDays?: number;
  systemTimezone?: string | null;
  tx?: Prisma.TransactionClient;
}

export interface GeneratedShiftMetadata {
  shiftCode: string;
  occurrenceDate: string; // 'YYYY-MM-DD'
  shiftDate: string; // 'YYYY-MM-DD'
  startTime: Date; // UTC DateTime
  endTime: Date; // UTC DateTime
  requiredWorkers: number;
  payRateHourly: number;
  currency: string;
}

export interface OccurrenceGenerationResult {
  recurringJobId: string;
  recurringJobCode: string;
  status: RecurringJobStatus;
  generatedCount: number;
  horizonEndDate: string | null; // 'YYYY-MM-DD'
  lastGeneratedUntil: string | null; // 'YYYY-MM-DD'
  createdShiftCodes: string[];
  shifts: GeneratedShiftMetadata[];
  skippedReason?: string;
}
