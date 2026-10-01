import { RecurrenceFrequency } from '@prisma/client';
import {
  RecurrenceCalculatorService,
} from '../src/services/recurrence-calculator.service';
import {
  validateRecurrenceRule,
  assertValidRecurrenceRule,
  isValidIanaTimezone,
} from '../src/validators/recurrence.validator';
import { ApiError } from '../src/utils/apiError';

describe('Recurring Jobs — Pure Recurrence Calculation Engine (Phase 3A)', () => {
  let calculator: RecurrenceCalculatorService;

  beforeEach(() => {
    calculator = new RecurrenceCalculatorService();
  });

  // =========================================================================
  // CATEGORY A: DAILY RECURRENCE TESTS
  // =========================================================================

  describe('Daily Recurrence Algorithm', () => {
    test('UT-REC-01: Daily Recurrence — Interval 1 (Window = 5 days)', () => {
      const dates = calculator.calculateOccurrences(
        {
          frequency: RecurrenceFrequency.DAILY,
          interval: 1,
          startDate: '2026-10-01',
        },
        {
          windowStartDate: '2026-10-01',
          windowEndDate: '2026-10-05',
        }
      );

      expect(dates).toHaveLength(5);
      expect(dates).toEqual([
        '2026-10-01',
        '2026-10-02',
        '2026-10-03',
        '2026-10-04',
        '2026-10-05',
      ]);
    });

    test('UT-REC-02: Daily Recurrence — Interval 3 (Window = 10 days)', () => {
      const dates = calculator.calculateOccurrences(
        {
          frequency: RecurrenceFrequency.DAILY,
          interval: 3,
          startDate: '2026-10-01',
        },
        {
          windowStartDate: '2026-10-01',
          windowEndDate: '2026-10-10',
        }
      );

      expect(dates).toHaveLength(4);
      expect(dates).toEqual(['2026-10-01', '2026-10-04', '2026-10-07', '2026-10-10']);
    });

    test('Daily Recurrence — Start date boundary compliance', () => {
      const dates = calculator.calculateOccurrences(
        {
          frequency: RecurrenceFrequency.DAILY,
          interval: 2,
          startDate: '2026-10-05',
        },
        {
          windowStartDate: '2026-10-01', // Window starts BEFORE startDate
          windowEndDate: '2026-10-11',
        }
      );

      // Must not generate occurrences before startDate (2026-10-05)
      expect(dates).toEqual(['2026-10-05', '2026-10-07', '2026-10-09', '2026-10-11']);
    });

    test('UT-REC-10: Recurrence End Date Compliance (Daily)', () => {
      const dates = calculator.calculateOccurrences(
        {
          frequency: RecurrenceFrequency.DAILY,
          interval: 1,
          startDate: '2026-10-01',
          endDate: '2026-10-07',
        },
        {
          windowStartDate: '2026-10-01',
          windowEndDate: '2026-10-31', // Window exceeds endDate
        }
      );

      expect(dates).toHaveLength(7);
      expect(dates[0]).toBe('2026-10-01');
      expect(dates[dates.length - 1]).toBe('2026-10-07');
      expect(dates.includes('2026-10-08')).toBe(false);
    });

    test('Daily isOccurrenceDate evaluation', () => {
      const rule = {
        frequency: RecurrenceFrequency.DAILY,
        interval: 2,
        startDate: '2026-10-01',
        endDate: '2026-10-10',
      };

      expect(calculator.isOccurrenceDate('2026-10-01', rule)).toBe(true);
      expect(calculator.isOccurrenceDate('2026-10-02', rule)).toBe(false);
      expect(calculator.isOccurrenceDate('2026-10-03', rule)).toBe(true);
      expect(calculator.isOccurrenceDate('2026-10-05', rule)).toBe(true);
      expect(calculator.isOccurrenceDate('2026-09-29', rule)).toBe(false); // before start
      expect(calculator.isOccurrenceDate('2026-10-11', rule)).toBe(false); // after end
    });
  });

  // =========================================================================
  // CATEGORY B: WEEKLY RECURRENCE TESTS (ANCHOR WEEK RULE)
  // =========================================================================

  describe('Weekly Recurrence Algorithm (Deterministic Anchor Week Rule)', () => {
    test('UT-REC-03: Weekly Recurrence — Single Weekday (Interval 1)', () => {
      // 2026-10-01 is Thursday. Selected weekday: Monday (1).
      const dates = calculator.calculateOccurrences(
        {
          frequency: RecurrenceFrequency.WEEKLY,
          interval: 1,
          startDate: '2026-10-01',
          byWeekdays: [1], // Monday
        },
        {
          windowStartDate: '2026-10-01',
          windowEndDate: '2026-10-25',
        }
      );

      // First Monday on or after 2026-10-01 is 2026-10-05
      expect(dates).toEqual(['2026-10-05', '2026-10-12', '2026-10-19']);
    });

    test('UT-REC-04: Weekly Recurrence — Multiple Weekdays (Mon, Wed, Fri)', () => {
      // 2026-10-01 is Thursday.
      // Selected weekdays: [1, 3, 5] (Mon, Wed, Fri).
      const dates = calculator.calculateOccurrences(
        {
          frequency: RecurrenceFrequency.WEEKLY,
          interval: 1,
          startDate: '2026-10-01',
          byWeekdays: [1, 3, 5],
        },
        {
          windowStartDate: '2026-10-01',
          windowEndDate: '2026-10-10',
        }
      );

      // In anchor week (Sep 28 - Oct 4):
      // Mon Sep 28 < Oct 1 (skip)
      // Wed Sep 30 < Oct 1 (skip)
      // Fri Oct 2 >= Oct 1 (valid)
      // In week 2 (Oct 5 - Oct 11):
      // Mon Oct 5 (valid)
      // Wed Oct 7 (valid)
      // Fri Oct 9 (valid)
      expect(dates).toEqual(['2026-10-02', '2026-10-05', '2026-10-07', '2026-10-09']);
    });

    test('UT-REC-05: Bi-Weekly Recurrence — Aligned Start Date', () => {
      // 2026-10-05 is Monday. Interval = 2. Selected weekday: Monday (1).
      const dates = calculator.calculateOccurrences(
        {
          frequency: RecurrenceFrequency.WEEKLY,
          interval: 2,
          startDate: '2026-10-05',
          byWeekdays: [1],
        },
        {
          windowStartDate: '2026-10-05',
          windowEndDate: '2026-11-10',
        }
      );

      expect(dates).toEqual(['2026-10-05', '2026-10-19', '2026-11-02']);
    });

    test('UT-REC-05B: Bi-Weekly Recurrence — Unaligned Start Date (Anchor Week skips early weekday)', () => {
      // startDate = Thursday 2026-10-01. Interval = 2. Selected weekday = Monday (1).
      // Anchor week: Sep 28 — Oct 4 (contains Thu Oct 1).
      // Monday Sep 28 is before startDate (Oct 1) -> skipped.
      // Week 1 (Oct 5-11): weeksBetween = 1. (1 % 2 !== 0) -> skipped.
      // Week 2 (Oct 12-18): weeksBetween = 2. (2 % 2 === 0) -> First valid occurrence: Monday Oct 12.
      const dates = calculator.calculateOccurrences(
        {
          frequency: RecurrenceFrequency.WEEKLY,
          interval: 2,
          startDate: '2026-10-01',
          byWeekdays: [1],
        },
        {
          windowStartDate: '2026-10-01',
          windowEndDate: '2026-11-15',
        }
      );

      expect(dates[0]).toBe('2026-10-12');
      expect(dates).toEqual(['2026-10-12', '2026-10-26', '2026-11-09']);
    });

    test('Weekly Recurrence — Sunday (0) and Saturday (6) selection', () => {
      // startDate = Friday 2026-10-02. Interval = 1. Weekdays: [0, 6] (Weekend: Sun, Sat).
      const dates = calculator.calculateOccurrences(
        {
          frequency: RecurrenceFrequency.WEEKLY,
          interval: 1,
          startDate: '2026-10-02',
          byWeekdays: [0, 6],
        },
        {
          windowStartDate: '2026-10-02',
          windowEndDate: '2026-10-12',
        }
      );

      // Anchor week (Sep 28 - Oct 4):
      // Sat Oct 3 (>= Oct 2)
      // Sun Oct 4 (>= Oct 2)
      // Week 2 (Oct 5 - Oct 11):
      // Sat Oct 10
      // Sun Oct 11
      expect(dates).toEqual(['2026-10-03', '2026-10-04', '2026-10-10', '2026-10-11']);
    });

    test('Weekly isOccurrenceDate evaluation', () => {
      const rule = {
        frequency: RecurrenceFrequency.WEEKLY,
        interval: 2,
        startDate: '2026-10-01', // Thursday
        byWeekdays: [1], // Monday
      };

      expect(calculator.isOccurrenceDate('2026-09-28', rule)).toBe(false); // Mon before start
      expect(calculator.isOccurrenceDate('2026-10-01', rule)).toBe(false); // Thu not in weekdays
      expect(calculator.isOccurrenceDate('2026-10-05', rule)).toBe(false); // Mon of week 1 (interval=2)
      expect(calculator.isOccurrenceDate('2026-10-12', rule)).toBe(true); // Mon of week 2
      expect(calculator.isOccurrenceDate('2026-10-19', rule)).toBe(false); // Mon of week 3
      expect(calculator.isOccurrenceDate('2026-10-26', rule)).toBe(true); // Mon of week 4
    });
  });

  // =========================================================================
  // CATEGORY C: MONTHLY RECURRENCE TESTS (LAST-DAY FALLBACK POLICY)
  // =========================================================================

  describe('Monthly Recurrence Algorithm (Last-Day Fallback Policy)', () => {
    test('UT-REC-06: Monthly Recurrence — Standard Day (15th of month)', () => {
      const dates = calculator.calculateOccurrences(
        {
          frequency: RecurrenceFrequency.MONTHLY,
          interval: 1,
          startDate: '2026-01-15',
          byMonthDay: 15,
        },
        {
          windowStartDate: '2026-01-15',
          windowEndDate: '2026-04-30',
        }
      );

      expect(dates).toEqual(['2026-01-15', '2026-02-15', '2026-03-15', '2026-04-15']);
    });

    test('UT-REC-07: Monthly Recurrence — Bi-Monthly (Interval 2)', () => {
      const dates = calculator.calculateOccurrences(
        {
          frequency: RecurrenceFrequency.MONTHLY,
          interval: 2,
          startDate: '2026-01-10',
          byMonthDay: 10,
        },
        {
          windowStartDate: '2026-01-10',
          windowEndDate: '2026-07-31',
        }
      );

      expect(dates).toEqual(['2026-01-10', '2026-03-10', '2026-05-10', '2026-07-10']);
    });

    test('UT-REC-08: Monthly Recurrence — 31st Day (Short Months Last-Day Fallback)', () => {
      // 2026 is non-leap year (Feb has 28 days, Apr has 30 days)
      const dates = calculator.calculateOccurrences(
        {
          frequency: RecurrenceFrequency.MONTHLY,
          interval: 1,
          startDate: '2026-01-31',
          byMonthDay: 31,
        },
        {
          windowStartDate: '2026-01-31',
          windowEndDate: '2026-05-01',
        }
      );

      expect(dates).toEqual([
        '2026-01-31',
        '2026-02-28', // Fallback to Feb 28
        '2026-03-31',
        '2026-04-30', // Fallback to Apr 30
      ]);
    });

    test('UT-REC-09: Monthly Recurrence — Leap Year Feb 29 Fallback', () => {
      // 2028 is a leap year (Feb has 29 days)
      const dates = calculator.calculateOccurrences(
        {
          frequency: RecurrenceFrequency.MONTHLY,
          interval: 1,
          startDate: '2028-01-31',
          byMonthDay: 31,
        },
        {
          windowStartDate: '2028-01-31',
          windowEndDate: '2028-03-31',
        }
      );

      expect(dates).toEqual(['2028-01-31', '2028-02-29', '2028-03-31']);
    });

    test('Monthly Recurrence — startDate after byMonthDay in start month', () => {
      // startDate is Jan 20, but byMonthDay is 10.
      // In Jan 2026, Jan 10 < Jan 20, so Jan is skipped.
      // First occurrence should be Feb 10, 2026.
      const dates = calculator.calculateOccurrences(
        {
          frequency: RecurrenceFrequency.MONTHLY,
          interval: 1,
          startDate: '2026-01-20',
          byMonthDay: 10,
        },
        {
          windowStartDate: '2026-01-20',
          windowEndDate: '2026-04-30',
        }
      );

      expect(dates).toEqual(['2026-02-10', '2026-03-10', '2026-04-10']);
    });

    test('Monthly isOccurrenceDate evaluation', () => {
      const rule = {
        frequency: RecurrenceFrequency.MONTHLY,
        interval: 1,
        startDate: '2026-01-31',
        byMonthDay: 31,
      };

      expect(calculator.isOccurrenceDate('2026-01-31', rule)).toBe(true);
      expect(calculator.isOccurrenceDate('2026-02-28', rule)).toBe(true); // last day
      expect(calculator.isOccurrenceDate('2026-02-27', rule)).toBe(false);
      expect(calculator.isOccurrenceDate('2026-03-31', rule)).toBe(true);
      expect(calculator.isOccurrenceDate('2026-04-30', rule)).toBe(true); // last day
      expect(calculator.isOccurrenceDate('2026-04-29', rule)).toBe(false);
    });
  });

  // =========================================================================
  // CATEGORY D: WINDOW, LIMITS & DETERMINISM
  // =========================================================================

  describe('Calculation Windows, Limits & Determinism', () => {
    test('maxOccurrences limit stops generation early', () => {
      const dates = calculator.calculateOccurrences(
        {
          frequency: RecurrenceFrequency.DAILY,
          interval: 1,
          startDate: '2026-10-01',
        },
        {
          windowStartDate: '2026-10-01',
          maxOccurrences: 3,
        }
      );

      expect(dates).toHaveLength(3);
      expect(dates).toEqual(['2026-10-01', '2026-10-02', '2026-10-03']);
    });

    test('Deterministic repeated execution (100 repeated runs produce identical outputs)', () => {
      const rule = {
        frequency: RecurrenceFrequency.WEEKLY,
        interval: 2,
        startDate: '2026-10-01',
        byWeekdays: [1, 5],
        endDate: '2026-12-31',
      };
      const options = {
        windowStartDate: '2026-10-01',
        windowEndDate: '2026-11-30',
      };

      const reference = calculator.calculateOccurrences(rule, options);

      for (let i = 0; i < 100; i++) {
        const result = calculator.calculateOccurrences(rule, options);
        expect(result).toEqual(reference);
      }
    });

    test('calculateOccurrencesDetailed returns properly formatted metadata', () => {
      const results = calculator.calculateOccurrencesDetailed(
        {
          frequency: RecurrenceFrequency.WEEKLY,
          interval: 1,
          startDate: '2026-10-01',
          byWeekdays: [1], // Monday
        },
        {
          windowStartDate: '2026-10-01',
          windowEndDate: '2026-10-15',
        }
      );

      expect(results).toHaveLength(2);
      expect(results[0].dateString).toBe('2026-10-05');
      expect(results[0].dayOfWeek).toBe(1); // Monday
      expect(results[0].occurrenceDate.toISOString()).toBe('2026-10-05T00:00:00.000Z');

      expect(results[1].dateString).toBe('2026-10-12');
      expect(results[1].dayOfWeek).toBe(1);
    });

    test('getNextOccurrenceDate retrieves next chronological date', () => {
      const rule = {
        frequency: RecurrenceFrequency.DAILY,
        interval: 3,
        startDate: '2026-10-01',
      };

      expect(calculator.getNextOccurrenceDate('2026-10-01', rule)).toBe('2026-10-04');
      expect(calculator.getNextOccurrenceDate('2026-10-02', rule)).toBe('2026-10-04');
      expect(calculator.getNextOccurrenceDate('2026-10-04', rule)).toBe('2026-10-07');
    });

    test('Empty result when window is out of range or past endDate', () => {
      const dates = calculator.calculateOccurrences(
        {
          frequency: RecurrenceFrequency.DAILY,
          interval: 1,
          startDate: '2026-10-01',
          endDate: '2026-10-05',
        },
        {
          windowStartDate: '2026-10-10',
          windowEndDate: '2026-10-20',
        }
      );

      expect(dates).toEqual([]);
    });
  });

  // =========================================================================
  // CATEGORY E: 3-TIER TIMEZONE RESOLUTION TESTS
  // =========================================================================

  describe('UT-TZ-01: 3-Tier Timezone Fallback Resolution', () => {
    test('Tier 1: Resolves job timezone when explicitly provided', () => {
      const tz = calculator.resolveTimezone('Africa/Nairobi', 'Europe/London', 'UTC');
      expect(tz).toBe('Africa/Nairobi');
    });

    test('Tier 2: Falls back to SystemSettings DEFAULT_PLATFORM_TIMEZONE when job timezone is null/empty', () => {
      const tz = calculator.resolveTimezone(null, 'Africa/Nairobi', 'UTC');
      expect(tz).toBe('Africa/Nairobi');
    });

    test('Tier 3: Falls back to hard default UTC when neither job nor system timezone is set', () => {
      const tz = calculator.resolveTimezone(null, null, 'UTC');
      expect(tz).toBe('UTC');
    });

    test('Rejects invalid IANA timezone in fallback resolution', () => {
      const isValid = isValidIanaTimezone('Invalid/City_Name');
      expect(isValid).toBe(false);

      const resolved = calculator.resolveTimezone('Invalid/Timezone', 'Africa/Nairobi', 'UTC');
      expect(resolved).toBe('Africa/Nairobi');
    });

    test('Validates recognized IANA timezone strings', () => {
      expect(isValidIanaTimezone('Europe/London')).toBe(true);
      expect(isValidIanaTimezone('Africa/Nairobi')).toBe(true);
      expect(isValidIanaTimezone('UTC')).toBe(true);
      expect(isValidIanaTimezone('America/New_York')).toBe(true);
      expect(isValidIanaTimezone('Asia/Kolkata')).toBe(true);
      expect(isValidIanaTimezone('')).toBe(false);
      expect(isValidIanaTimezone('   ')).toBe(false);
    });
  });

  // =========================================================================
  // CATEGORY F: VALIDATION TESTS
  // =========================================================================

  describe('Validation & Error Handling', () => {
    test('Rejects invalid interval (< 1 or non-integer)', () => {
      const res1 = validateRecurrenceRule({
        frequency: RecurrenceFrequency.DAILY,
        interval: 0,
        startDate: '2026-10-01',
      });
      expect(res1.isValid).toBe(false);
      expect(res1.errors.some((e: string) => e.includes('Interval'))).toBe(true);

      const res2 = validateRecurrenceRule({
        frequency: RecurrenceFrequency.DAILY,
        interval: -5,
        startDate: '2026-10-01',
      });
      expect(res2.isValid).toBe(false);

      const res3 = validateRecurrenceRule({
        frequency: RecurrenceFrequency.DAILY,
        interval: 1.5,
        startDate: '2026-10-01',
      });
      expect(res3.isValid).toBe(false);
    });

    test('Rejects WEEKLY frequency without byWeekdays or with empty array', () => {
      const res = validateRecurrenceRule({
        frequency: RecurrenceFrequency.WEEKLY,
        interval: 1,
        startDate: '2026-10-01',
        byWeekdays: [],
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e: string) => e.includes('byWeekdays'))).toBe(true);
    });

    test('Rejects invalid weekday values (e.g. 7 or -1 or decimals)', () => {
      const res = validateRecurrenceRule({
        frequency: RecurrenceFrequency.WEEKLY,
        interval: 1,
        startDate: '2026-10-01',
        byWeekdays: [1, 7], // 7 is invalid (only 0-6 allowed)
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e: string) => e.includes('Invalid weekday value'))).toBe(true);
    });

    test('Rejects MONTHLY frequency without byMonthDay or out of range [1..31]', () => {
      const res1 = validateRecurrenceRule({
        frequency: RecurrenceFrequency.MONTHLY,
        interval: 1,
        startDate: '2026-10-01',
      });
      expect(res1.isValid).toBe(false);

      const res2 = validateRecurrenceRule({
        frequency: RecurrenceFrequency.MONTHLY,
        interval: 1,
        startDate: '2026-10-01',
        byMonthDay: 0,
      });
      expect(res2.isValid).toBe(false);

      const res3 = validateRecurrenceRule({
        frequency: RecurrenceFrequency.MONTHLY,
        interval: 1,
        startDate: '2026-10-01',
        byMonthDay: 32,
      });
      expect(res3.isValid).toBe(false);
    });

    test('Rejects endDate before startDate', () => {
      const res = validateRecurrenceRule({
        frequency: RecurrenceFrequency.DAILY,
        interval: 1,
        startDate: '2026-10-10',
        endDate: '2026-10-05',
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e: string) => e.includes('cannot be before startDate'))).toBe(true);
    });

    test('Rejects invalid calendar date strings (e.g. 2026-02-30)', () => {
      const res = validateRecurrenceRule({
        frequency: RecurrenceFrequency.DAILY,
        interval: 1,
        startDate: '2026-02-30', // Feb 30 does not exist
      });
      expect(res.isValid).toBe(false);
    });

    test('assertValidRecurrenceRule throws ApiError.validationError on invalid rule', () => {
      expect(() => {
        assertValidRecurrenceRule({
          frequency: RecurrenceFrequency.DAILY,
          interval: -1,
          startDate: '2026-10-01',
        });
      }).toThrow(ApiError);
    });
  });
});
