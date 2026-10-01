import { z } from 'zod';
import { RecurrenceFrequency } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import { RecurrenceRuleInput, RecurrenceValidationResult } from '../types/recurrence.types';

export const recurrenceFrequencyEnum = z.nativeEnum(RecurrenceFrequency);

/**
 * Validates whether a given string is a valid IANA timezone name.
 */
export function isValidIanaTimezone(timeZone: string): boolean {
  if (!timeZone || typeof timeZone !== 'string' || timeZone.trim().length === 0) {
    return false;
  }
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timeZone.trim() });
    return true;
  } catch {
    return false;
  }
}

/**
 * Standard date string format regex (YYYY-MM-DD)
 */
const DATE_STRING_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;

/**
 * Parses a Date or string input into standard 'YYYY-MM-DD' calendar date string.
 * Returns null if invalid date.
 */
export function toCalendarDateString(input: string | Date | null | undefined): string | null {
  if (input === null || input === undefined) {
    return null;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (DATE_STRING_REGEX.test(trimmed)) {
      // Validate that it's a real calendar date (e.g., reject 2026-02-30)
      const [yearStr, monthStr, dayStr] = trimmed.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);

      const utcDate = new Date(Date.UTC(year, month - 1, day));
      if (
        utcDate.getUTCFullYear() === year &&
        utcDate.getUTCMonth() === month - 1 &&
        utcDate.getUTCDate() === day
      ) {
        return trimmed;
      }
      return null;
    }

    // Try parsing ISO or other string date formats
    const parsed = new Date(trimmed);
    if (isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.toISOString().slice(0, 10);
  }

  if (input instanceof Date) {
    if (isNaN(input.getTime())) {
      return null;
    }
    return input.toISOString().slice(0, 10);
  }

  return null;
}

/**
 * Zod schema for recurrence rule inputs.
 */
export const recurrenceRuleSchema = z
  .object({
    frequency: recurrenceFrequencyEnum,
    interval: z.coerce.number().int('Interval must be an integer').min(1, 'Interval must be >= 1').default(1),
    startDate: z.union([z.string().trim(), z.date()]),
    endDate: z.union([z.string().trim(), z.date()]).nullable().optional(),
    byWeekdays: z.array(z.coerce.number().int().min(0).max(6)).optional().default([]),
    byMonthDay: z.coerce.number().int().min(1).max(31).nullable().optional(),
    timezone: z.string().trim().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const startStr = toCalendarDateString(data.startDate);
    if (!startStr) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['startDate'],
        message: 'startDate must be a valid calendar date (YYYY-MM-DD)',
      });
    }

    if (data.endDate !== null && data.endDate !== undefined) {
      const endStr = toCalendarDateString(data.endDate);
      if (!endStr) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endDate'],
          message: 'endDate must be a valid calendar date (YYYY-MM-DD)',
        });
      } else if (startStr && endStr < startStr) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endDate'],
          message: 'endDate cannot be before startDate',
        });
      }
    }

    if (data.frequency === RecurrenceFrequency.WEEKLY) {
      if (!Array.isArray(data.byWeekdays) || data.byWeekdays.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['byWeekdays'],
          message: 'WEEKLY frequency requires byWeekdays with at least one valid weekday (0-6)',
        });
      } else {
        const invalidDays = data.byWeekdays.filter(
          (d) => !Number.isInteger(d) || d < 0 || d > 6
        );
        if (invalidDays.length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['byWeekdays'],
            message: 'byWeekdays elements must be integers between 0 (Sunday) and 6 (Saturday)',
          });
        }
      }
    }

    if (data.frequency === RecurrenceFrequency.MONTHLY) {
      if (
        data.byMonthDay === null ||
        data.byMonthDay === undefined ||
        !Number.isInteger(data.byMonthDay) ||
        data.byMonthDay < 1 ||
        data.byMonthDay > 31
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['byMonthDay'],
          message: 'MONTHLY frequency requires byMonthDay to be an integer between 1 and 31',
        });
      }
    }

    if (data.timezone && !isValidIanaTimezone(data.timezone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['timezone'],
        message: `Invalid IANA timezone identifier: '${data.timezone}'`,
      });
    }
  });

/**
 * Pure programmatic validator for recurrence rules.
 * Collects all validation errors without throwing.
 */
export function validateRecurrenceRule(rule: RecurrenceRuleInput): RecurrenceValidationResult {
  const errors: string[] = [];

  if (!rule) {
    return { isValid: false, errors: ['Recurrence rule is required'] };
  }

  // 1. Validate Frequency
  const validFrequencies: string[] = [
    RecurrenceFrequency.DAILY,
    RecurrenceFrequency.WEEKLY,
    RecurrenceFrequency.MONTHLY,
  ];
  if (!rule.frequency || !validFrequencies.includes(rule.frequency)) {
    errors.push(`Invalid recurrence frequency: '${rule.frequency}'. Supported: DAILY, WEEKLY, MONTHLY`);
  }

  // 2. Validate Interval
  const interval = rule.interval ?? 1;
  if (!Number.isInteger(interval) || interval < 1) {
    errors.push(`Interval must be an integer >= 1. Received: ${interval}`);
  }

  // 3. Validate Start Date
  const startDateStr = toCalendarDateString(rule.startDate);
  if (!startDateStr) {
    errors.push('startDate must be a valid date or YYYY-MM-DD string');
  }

  // 4. Validate End Date
  if (rule.endDate !== null && rule.endDate !== undefined) {
    const endDateStr = toCalendarDateString(rule.endDate);
    if (!endDateStr) {
      errors.push('endDate must be a valid date or YYYY-MM-DD string');
    } else if (startDateStr && endDateStr < startDateStr) {
      errors.push(`endDate (${endDateStr}) cannot be before startDate (${startDateStr})`);
    }
  }

  // 5. Validate Weekly Rule (byWeekdays)
  if (rule.frequency === RecurrenceFrequency.WEEKLY) {
    if (!rule.byWeekdays || !Array.isArray(rule.byWeekdays) || rule.byWeekdays.length === 0) {
      errors.push('WEEKLY frequency requires byWeekdays to contain at least one weekday [0..6]');
    } else {
      for (const d of rule.byWeekdays) {
        if (!Number.isInteger(d) || d < 0 || d > 6) {
          errors.push(`Invalid weekday value: ${d}. Allowed values are integers 0 (Sunday) through 6 (Saturday)`);
        }
      }
    }
  }

  // 6. Validate Monthly Rule (byMonthDay)
  if (rule.frequency === RecurrenceFrequency.MONTHLY) {
    if (
      rule.byMonthDay === null ||
      rule.byMonthDay === undefined ||
      !Number.isInteger(rule.byMonthDay) ||
      rule.byMonthDay < 1 ||
      rule.byMonthDay > 31
    ) {
      errors.push(`MONTHLY frequency requires byMonthDay to be an integer between 1 and 31. Received: ${rule.byMonthDay}`);
    }
  }

  // 7. Validate Timezone (if provided)
  if (rule.timezone && !isValidIanaTimezone(rule.timezone)) {
    errors.push(`Invalid IANA timezone identifier: '${rule.timezone}'`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Asserts that a recurrence rule is valid, throwing ApiError.validationError if not.
 */
export function assertValidRecurrenceRule(rule: RecurrenceRuleInput): void {
  const result = validateRecurrenceRule(rule);
  if (!result.isValid) {
    throw ApiError.validationError(`Invalid recurrence rule configuration: ${result.errors.join('; ')}`, {
      errors: result.errors,
    });
  }
}
