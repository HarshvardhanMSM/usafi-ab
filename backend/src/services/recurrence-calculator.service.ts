import {
  RecurrenceFrequency,
  RecurrenceRuleInput,
  RecurrenceCalculationOptions,
  CalendarDateParts,
  OccurrenceResult,
  RecurrenceValidationResult,
} from '../types/recurrence.types';
import {
  toCalendarDateString,
  validateRecurrenceRule,
  assertValidRecurrenceRule,
  isValidIanaTimezone,
} from '../validators/recurrence.validator';

/**
 * Pure calculation engine for Usafi Recurring Jobs.
 *
 * Fully deterministic, side-effect free calendar recurrence solver supporting:
 * - DAILY with interval >= 1
 * - WEEKLY with Deterministic Anchor Week rule and interval >= 1
 * - MONTHLY with Last-Day Fallback policy and interval >= 1
 * - 3-tier Timezone Resolution helper
 */
export class RecurrenceCalculatorService {
  /**
   * Resolves timezone through the approved 3-tier fallback hierarchy:
   * 1. RecurringJob.timezone (if explicitly set and valid)
   * 2. SystemSettings DEFAULT_PLATFORM_TIMEZONE (if set and valid)
   * 3. Hard fallback: 'UTC'
   */
  public resolveTimezone(
    jobTimezone?: string | null,
    systemTimezone?: string | null,
    defaultFallback = 'UTC'
  ): string {
    if (jobTimezone && isValidIanaTimezone(jobTimezone)) {
      return jobTimezone.trim();
    }
    if (systemTimezone && isValidIanaTimezone(systemTimezone)) {
      return systemTimezone.trim();
    }
    if (isValidIanaTimezone(defaultFallback)) {
      return defaultFallback.trim();
    }
    return 'UTC';
  }

  /**
   * Validates a recurrence rule configuration.
   */
  public validateRule(rule: RecurrenceRuleInput): RecurrenceValidationResult {
    return validateRecurrenceRule(rule);
  }

  /**
   * Asserts validity of a recurrence rule, throwing ApiError.validationError if invalid.
   */
  public assertValidRule(rule: RecurrenceRuleInput): void {
    assertValidRecurrenceRule(rule);
  }

  /**
   * Calculates occurrence calendar dates (YYYY-MM-DD) for a given recurrence rule within an optional window.
   */
  public calculateOccurrences(
    rule: RecurrenceRuleInput,
    options: RecurrenceCalculationOptions = {}
  ): string[] {
    const detailed = this.calculateOccurrencesDetailed(rule, options);
    return detailed.map((occ) => occ.dateString);
  }

  /**
   * Calculates detailed occurrence instances with Date and dayOfWeek metadata.
   */
  public calculateOccurrencesDetailed(
    rule: RecurrenceRuleInput,
    options: RecurrenceCalculationOptions = {}
  ): OccurrenceResult[] {
    // Assert valid rule first
    assertValidRecurrenceRule(rule);

    const startDateStr = toCalendarDateString(rule.startDate)!;
    const startDateParts = this.parseDateString(startDateStr);

    const endDateStr = rule.endDate ? toCalendarDateString(rule.endDate) : null;
    const endDateParts = endDateStr ? this.parseDateString(endDateStr) : null;

    const interval = rule.interval ?? 1;

    // Window bounds
    const windowStartStr = options.windowStartDate
      ? toCalendarDateString(options.windowStartDate) ?? startDateStr
      : startDateStr;
    const windowStartParts = this.parseDateString(windowStartStr);

    // If windowStartDate is before rule.startDate, clamp to startDate
    const effectiveWindowStartParts =
      this.compareDates(windowStartParts, startDateParts) < 0 ? startDateParts : windowStartParts;

    const maxOccurrences = options.maxOccurrences ?? 1000;

    let windowEndParts: CalendarDateParts | null = null;
    if (options.windowEndDate) {
      const parsedWindowEnd = toCalendarDateString(options.windowEndDate);
      if (parsedWindowEnd) {
        windowEndParts = this.parseDateString(parsedWindowEnd);
      }
    }

    // Effective end date is min(endDate, windowEndDate)
    let effectiveEndParts: CalendarDateParts | null = endDateParts;
    if (windowEndParts) {
      if (!effectiveEndParts || this.compareDates(windowEndParts, effectiveEndParts) < 0) {
        effectiveEndParts = windowEndParts;
      }
    }

    // If effective start is after effective end, no occurrences are possible
    if (effectiveEndParts && this.compareDates(effectiveWindowStartParts, effectiveEndParts) > 0) {
      return [];
    }

    let results: CalendarDateParts[] = [];

    switch (rule.frequency) {
      case RecurrenceFrequency.DAILY:
        results = this.generateDailyOccurrences(
          startDateParts,
          interval,
          effectiveWindowStartParts,
          effectiveEndParts,
          maxOccurrences
        );
        break;

      case RecurrenceFrequency.WEEKLY:
        results = this.generateWeeklyOccurrences(
          startDateParts,
          interval,
          rule.byWeekdays ?? [],
          effectiveWindowStartParts,
          effectiveEndParts,
          maxOccurrences
        );
        break;

      case RecurrenceFrequency.MONTHLY:
        results = this.generateMonthlyOccurrences(
          startDateParts,
          interval,
          rule.byMonthDay!,
          effectiveWindowStartParts,
          effectiveEndParts,
          maxOccurrences
        );
        break;
    }

    // Map to OccurrenceResult instances
    return results.map((parts) => {
      const dateString = this.formatDate(parts);
      const occurrenceDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
      const dayOfWeek = occurrenceDate.getUTCDay();
      return {
        dateString,
        occurrenceDate,
        dayOfWeek,
      };
    });
  }

  /**
   * Checks whether a specific calendar date is an occurrence for the given rule.
   */
  public isOccurrenceDate(date: string | Date, rule: RecurrenceRuleInput): boolean {
    assertValidRecurrenceRule(rule);

    const dateStr = toCalendarDateString(date);
    if (!dateStr) return false;

    const target = this.parseDateString(dateStr);
    const start = this.parseDateString(toCalendarDateString(rule.startDate)!);

    // Rule: Date must be >= startDate
    if (this.compareDates(target, start) < 0) {
      return false;
    }

    // Rule: Date must be <= endDate (if endDate exists)
    if (rule.endDate) {
      const endStr = toCalendarDateString(rule.endDate);
      if (endStr) {
        const end = this.parseDateString(endStr);
        if (this.compareDates(target, end) > 0) {
          return false;
        }
      }
    }

    const interval = rule.interval ?? 1;

    switch (rule.frequency) {
      case RecurrenceFrequency.DAILY: {
        const days = this.daysBetween(start, target);
        return days % interval === 0;
      }

      case RecurrenceFrequency.WEEKLY: {
        const weekdays = rule.byWeekdays ?? [];
        const targetDayOfWeek = this.getUtcDayOfWeek(target);
        if (!weekdays.includes(targetDayOfWeek)) {
          return false;
        }

        const anchorMonday = this.getMondayOfWeek(start);
        const targetMonday = this.getMondayOfWeek(target);
        const weeks = this.weeksBetween(anchorMonday, targetMonday);

        return weeks >= 0 && weeks % interval === 0;
      }

      case RecurrenceFrequency.MONTHLY: {
        const byMonthDay = rule.byMonthDay!;
        const monthsDiff = (target.year - start.year) * 12 + (target.month - start.month);
        if (monthsDiff < 0 || monthsDiff % interval !== 0) {
          return false;
        }

        const dim = this.daysInMonth(target.year, target.month);
        const expectedDay = Math.min(byMonthDay, dim);
        return target.day === expectedDay;
      }

      default:
        return false;
    }
  }

  /**
   * Computes the next occurrence calendar date strictly after `afterDate`.
   */
  public getNextOccurrenceDate(
    afterDate: string | Date,
    rule: RecurrenceRuleInput,
    searchHorizonDays = 730
  ): string | null {
    assertValidRecurrenceRule(rule);

    const afterDateStr = toCalendarDateString(afterDate);
    if (!afterDateStr) return null;

    const afterParts = this.parseDateString(afterDateStr);
    const startParts = this.parseDateString(toCalendarDateString(rule.startDate)!);

    // If afterDate is before startDate, first occurrence will be on or after startDate
    const searchStartParts =
      this.compareDates(afterParts, startParts) < 0
        ? startParts
        : this.addDays(afterParts, 1);

    const horizonEndParts = this.addDays(searchStartParts, searchHorizonDays);

    const occurrences = this.calculateOccurrences(rule, {
      windowStartDate: this.formatDate(searchStartParts),
      windowEndDate: this.formatDate(horizonEndParts),
      maxOccurrences: 1,
    });

    return occurrences.length > 0 ? occurrences[0] : null;
  }

  // =========================================================================
  // CORE FREQUENCY GENERATORS
  // =========================================================================

  /**
   * Daily generator: daysBetween(startDate, D) % interval === 0
   */
  private generateDailyOccurrences(
    startDate: CalendarDateParts,
    interval: number,
    windowStart: CalendarDateParts,
    effectiveEnd: CalendarDateParts | null,
    maxOccurrences: number
  ): CalendarDateParts[] {
    const results: CalendarDateParts[] = [];

    // Calculate the first step k >= 0 such that (startDate + k * interval) >= windowStart
    const daysFromStartToWindow = this.daysBetween(startDate, windowStart);
    let startStep = 0;
    if (daysFromStartToWindow > 0) {
      startStep = Math.ceil(daysFromStartToWindow / interval);
    }

    let k = startStep;
    while (results.length < maxOccurrences) {
      const candidate = this.addDays(startDate, k * interval);

      if (effectiveEnd && this.compareDates(candidate, effectiveEnd) > 0) {
        break;
      }

      if (this.compareDates(candidate, windowStart) >= 0) {
        results.push(candidate);
      }

      k++;
    }

    return results;
  }

  /**
   * Weekly generator: Deterministic Anchor Week Rule
   *
   * Anchor week = ISO week containing startDate (Monday-based).
   * A candidate week is valid when:
   *   weeksBetween(anchorWeek, candidateWeek) % interval === 0
   * Candidate date must:
   *   1. be >= startDate
   *   2. belong to a selected weekday in byWeekdays
   */
  private generateWeeklyOccurrences(
    startDate: CalendarDateParts,
    interval: number,
    byWeekdays: number[],
    windowStart: CalendarDateParts,
    effectiveEnd: CalendarDateParts | null,
    maxOccurrences: number
  ): CalendarDateParts[] {
    const results: CalendarDateParts[] = [];
    const uniqueWeekdays = Array.from(new Set(byWeekdays)).sort((a, b) => a - b);

    if (uniqueWeekdays.length === 0) {
      return [];
    }

    const anchorMonday = this.getMondayOfWeek(startDate);

    // Find the starting week step w >= 0 such that the week's end (Sunday) is >= windowStart
    const windowStartMonday = this.getMondayOfWeek(windowStart);
    const weeksToWindowStart = this.weeksBetween(anchorMonday, windowStartMonday);

    let startWeekStep = 0;
    if (weeksToWindowStart > 0) {
      // Find the first multiple of interval >= weeksToWindowStart
      startWeekStep = Math.floor(weeksToWindowStart / interval) * interval;
      if (startWeekStep < 0) startWeekStep = 0;
    }

    let w = startWeekStep;
    while (results.length < maxOccurrences) {
      const currentWeekMonday = this.addDays(anchorMonday, w * 7);

      // If the Monday of this week is past effectiveEnd, stop
      if (effectiveEnd && this.compareDates(currentWeekMonday, effectiveEnd) > 0) {
        break;
      }

      // Check all 7 days of this valid week (Mon = offset 0 .. Sun = offset 6)
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const candidateDate = this.addDays(currentWeekMonday, dayOffset);
        const dayOfWeek = this.getUtcDayOfWeek(candidateDate);

        if (uniqueWeekdays.includes(dayOfWeek)) {
          // 1. Must be >= startDate
          if (this.compareDates(candidateDate, startDate) < 0) {
            continue;
          }

          // 2. Must be <= effectiveEnd (if specified)
          if (effectiveEnd && this.compareDates(candidateDate, effectiveEnd) > 0) {
            continue;
          }

          // 3. Must be >= windowStart
          if (this.compareDates(candidateDate, windowStart) < 0) {
            continue;
          }

          results.push(candidateDate);

          if (results.length >= maxOccurrences) {
            break;
          }
        }
      }

      w += interval;
    }

    return results;
  }

  /**
   * Monthly generator: Last-Day Fallback Policy
   *
   * For month step k (k % interval === 0):
   * Target month = startMonth + k
   * Day = min(byMonthDay, daysInMonth(targetMonth))
   */
  private generateMonthlyOccurrences(
    startDate: CalendarDateParts,
    interval: number,
    byMonthDay: number,
    windowStart: CalendarDateParts,
    effectiveEnd: CalendarDateParts | null,
    maxOccurrences: number
  ): CalendarDateParts[] {
    const results: CalendarDateParts[] = [];

    // Calculate starting month step
    let startStep = 0;
    const monthsToWindow =
      (windowStart.year - startDate.year) * 12 + (windowStart.month - startDate.month);
    if (monthsToWindow > 0) {
      startStep = Math.floor(monthsToWindow / interval) * interval;
      if (startStep < 0) startStep = 0;
    }

    let k = startStep;
    while (results.length < maxOccurrences) {
      const targetYear = startDate.year + Math.floor((startDate.month - 1 + k) / 12);
      const targetMonth = ((startDate.month - 1 + k) % 12) + 1;

      // If the 1st of the target month is past effectiveEnd, stop
      const firstOfMonth: CalendarDateParts = { year: targetYear, month: targetMonth, day: 1 };
      if (effectiveEnd && this.compareDates(firstOfMonth, effectiveEnd) > 0) {
        break;
      }

      const dim = this.daysInMonth(targetYear, targetMonth);
      const targetDay = Math.min(byMonthDay, dim);

      const candidate: CalendarDateParts = {
        year: targetYear,
        month: targetMonth,
        day: targetDay,
      };

      // 1. Must be >= startDate
      if (this.compareDates(candidate, startDate) >= 0) {
        // 2. Must be <= effectiveEnd
        if (!effectiveEnd || this.compareDates(candidate, effectiveEnd) <= 0) {
          // 3. Must be >= windowStart
          if (this.compareDates(candidate, windowStart) >= 0) {
            results.push(candidate);
          }
        }
      }

      k += interval;
    }

    return results;
  }

  // =========================================================================
  // PURE CALENDAR DATE MATH UTILITIES
  // =========================================================================

  /**
   * Parses YYYY-MM-DD into integer parts.
   */
  public parseDateString(dateStr: string): CalendarDateParts {
    const [yearStr, monthStr, dayStr] = dateStr.split('-');
    return {
      year: parseInt(yearStr, 10),
      month: parseInt(monthStr, 10),
      day: parseInt(dayStr, 10),
    };
  }

  /**
   * Formats calendar date parts into YYYY-MM-DD.
   */
  public formatDate(parts: CalendarDateParts): string {
    const y = parts.year.toString().padStart(4, '0');
    const m = parts.month.toString().padStart(2, '0');
    const d = parts.day.toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Compares two calendar dates.
   * Returns negative if a < b, 0 if a === b, positive if a > b.
   */
  public compareDates(a: CalendarDateParts, b: CalendarDateParts): number {
    if (a.year !== b.year) return a.year - b.year;
    if (a.month !== b.month) return a.month - b.month;
    return a.day - b.day;
  }

  /**
   * Computes exact calendar days between two calendar dates (b - a).
   */
  public daysBetween(a: CalendarDateParts, b: CalendarDateParts): number {
    const utcA = Date.UTC(a.year, a.month - 1, a.day);
    const utcB = Date.UTC(b.year, b.month - 1, b.day);
    return Math.round((utcB - utcA) / 86400000);
  }

  /**
   * Adds N calendar days to a calendar date.
   */
  public addDays(date: CalendarDateParts, days: number): CalendarDateParts {
    const utc = new Date(Date.UTC(date.year, date.month - 1, date.day + days));
    return {
      year: utc.getUTCFullYear(),
      month: utc.getUTCMonth() + 1,
      day: utc.getUTCDate(),
    };
  }

  /**
   * Gets UTC day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday).
   */
  public getUtcDayOfWeek(date: CalendarDateParts): number {
    const utc = new Date(Date.UTC(date.year, date.month - 1, date.day));
    return utc.getUTCDay();
  }

  /**
   * Finds the Monday date of the ISO week containing the given calendar date.
   * In ISO-8601: Monday is day 1, Sunday is day 7.
   */
  public getMondayOfWeek(date: CalendarDateParts): CalendarDateParts {
    const dow = this.getUtcDayOfWeek(date); // 0=Sun, 1=Mon, ..., 6=Sat
    const isoDay = dow === 0 ? 7 : dow; // 1=Mon .. 7=Sun
    return this.addDays(date, -(isoDay - 1));
  }

  /**
   * Computes integer weeks between two Monday dates (b - a).
   */
  public weeksBetween(anchorMonday: CalendarDateParts, candidateMonday: CalendarDateParts): number {
    const days = this.daysBetween(anchorMonday, candidateMonday);
    return Math.round(days / 7);
  }

  /**
   * Returns total days in a given month.
   */
  public daysInMonth(year: number, month: number): number {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
  }
}

export const recurrenceCalculator = new RecurrenceCalculatorService();
