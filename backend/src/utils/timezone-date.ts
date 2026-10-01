import { isValidIanaTimezone } from '../validators/recurrence.validator';

/**
 * Parses a "HH:mm" time string into hours and minutes.
 */
export function parseTimeToHoursMinutes(timeStr: string): { hours: number; minutes: number } {
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) {
    throw new Error(`Invalid time format '${timeStr}'. Expected HH:mm`);
  }
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time values in '${timeStr}'. Hours must be 0-23, minutes 0-59`);
  }
  return { hours, minutes };
}

/**
 * Converts a local calendar date and time in a specific IANA timezone into a UTC Date object.
 *
 * Uses native Intl.DateTimeFormat (zero third-party dependencies) with DST offset compensation.
 */
export function localDateTimeToUtc(
  year: number,
  month: number, // 1-12
  day: number, // 1-31
  hour: number, // 0-23
  minute: number, // 0-59
  timeZone = 'UTC'
): Date {
  const tz = isValidIanaTimezone(timeZone) ? timeZone.trim() : 'UTC';

  if (tz.toUpperCase() === 'UTC') {
    return new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
  }

  // Initial estimation treating local time numbers as UTC epoch milliseconds
  const guessUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0, 0);

  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const getTzEpochMs = (epochMs: number): number => {
    const parts = dtf.formatToParts(new Date(epochMs));
    let y = year,
      m = month,
      d = day,
      h = hour,
      min = minute,
      s = 0;
    for (const part of parts) {
      if (part.type === 'year') y = parseInt(part.value, 10);
      else if (part.type === 'month') m = parseInt(part.value, 10);
      else if (part.type === 'day') d = parseInt(part.value, 10);
      else if (part.type === 'hour') h = parseInt(part.value, 10);
      else if (part.type === 'minute') min = parseInt(part.value, 10);
      else if (part.type === 'second') s = parseInt(part.value, 10);
    }
    if (h === 24) h = 0; // Normalize 24:00 to 00:00
    return Date.UTC(y, m - 1, d, h, min, s);
  };

  // Pass 1: compute base offset
  const tzTime1 = getTzEpochMs(guessUtcMs);
  const offset1 = tzTime1 - guessUtcMs;
  let targetUtcMs = guessUtcMs - offset1;

  // Pass 2: refine for DST transition boundaries
  const tzTime2 = getTzEpochMs(targetUtcMs);
  const offset2 = tzTime2 - targetUtcMs;
  if (offset2 !== offset1) {
    targetUtcMs = guessUtcMs - offset2;
  }

  return new Date(targetUtcMs);
}

/**
 * Formats a local calendar date string (YYYY-MM-DD) for today in a given IANA timezone.
 */
export function getTodayCalendarDateInTimezone(timeZone = 'UTC', refDate: Date = new Date()): string {
  const tz = isValidIanaTimezone(timeZone) ? timeZone.trim() : 'UTC';
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return dtf.format(refDate);
}

/**
 * Generates an approved length-safe shift code: RJXXXX-YYMMDD (max 20 characters).
 * Example: RJ0001-261005
 */
export function generateShiftCode(recurringJobCode: string, occurrenceDateStr: string): string {
  const [yearStr, monthStr, dayStr] = occurrenceDateStr.split('-');
  const yy = yearStr.slice(-2);
  const mm = monthStr.padStart(2, '0');
  const dd = dayStr.padStart(2, '0');

  const code = `${recurringJobCode.trim()}-${yy}${mm}${dd}`;
  if (code.length > 20) {
    throw new Error(`Generated shift code '${code}' exceeds VARCHAR(20) limit`);
  }
  return code;
}
