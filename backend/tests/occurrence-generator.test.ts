import { Prisma, RecurrenceFrequency, RecurringJob, RecurringJobStatus, ShiftStatus } from '@prisma/client';
import { OccurrenceGeneratorService } from '../src/services/occurrence-generator.service';
import { recurringJobRepository } from '../src/repositories/recurring-job.repository';
import { prisma } from '../src/config/database';

describe('Recurring Jobs — Occurrence Generation Layer (Phase 3B)', () => {
  let generator: OccurrenceGeneratorService;

  const sampleRoleId = 'e8b4e723-5798-4a64-9a3d-8e6d24601111';
  const sampleLocationId = 'a1b2c3d4-e5f6-7890-1234-56789abcdef0';
  const sampleAdminId = '99999999-9999-9999-9999-999999999999';

  const createMockJob = (overrides: Partial<RecurringJob> = {}): RecurringJob => ({
    id: 'job-uuid-1',
    recurringJobCode: 'RJ0001',
    title: 'Daily Facilities Cleaning',
    jobRoleId: sampleRoleId,
    locationId: sampleLocationId,
    timezone: 'Europe/London',
    startTimeOfDay: '08:00',
    endTimeOfDay: '16:00',
    breakDurationMinutes: 30,
    payRateHourly: new Prisma.Decimal('15.50'),
    currency: 'GBP',
    requiredWorkers: 3,
    description: 'Daily office cleaning shift',
    requirements: 'Cleaning experience',
    adminNotes: 'Assigned to team alpha',
    status: RecurringJobStatus.ACTIVE,
    recurrenceFrequency: RecurrenceFrequency.DAILY,
    interval: 1,
    byWeekdays: [],
    byMonthDay: null,
    startDate: new Date('2026-10-01T00:00:00.000Z'),
    endDate: null,
    lastGeneratedUntil: null,
    createdById: sampleAdminId,
    createdAt: new Date('2026-09-30T10:00:00.000Z'),
    updatedAt: new Date('2026-09-30T10:00:00.000Z'),
    ...overrides,
  });

  let createdShiftsStore: Prisma.ShiftCreateManyInput[] = [];
  let updatedLastGeneratedUntil: { id: string; date: Date } | null = null;

  beforeEach(() => {
    generator = new OccurrenceGeneratorService();
    createdShiftsStore = [];
    updatedLastGeneratedUntil = null;

    // Mock repository methods
    jest.spyOn(recurringJobRepository, 'createShiftOccurrences').mockImplementation(async (data) => {
      // Simulate PostgreSQL skipDuplicates behavior
      let added = 0;
      for (const item of data) {
        const itemDateStr = item.occurrenceDate instanceof Date ? item.occurrenceDate.toISOString() : String(item.occurrenceDate);
        const exists = createdShiftsStore.some((s) => {
          const sDateStr = s.occurrenceDate instanceof Date ? s.occurrenceDate.toISOString() : String(s.occurrenceDate);
          return s.recurringJobId === item.recurringJobId && sDateStr === itemDateStr;
        });
        if (!exists) {
          createdShiftsStore.push(item);
          added++;
        }
      }
      return added;
    });

    jest.spyOn(recurringJobRepository, 'updateLastGeneratedUntil').mockImplementation(async (id, date) => {
      updatedLastGeneratedUntil = { id, date };
      return {} as RecurringJob;
    });

    jest.spyOn(recurringJobRepository, 'getDefaultPlatformTimezone').mockResolvedValue('UTC');
    jest.spyOn(recurringJobRepository, 'getGenerationWindowDays').mockResolvedValue(30);

    // Mock prisma.$transaction to pass through
    jest.spyOn(prisma, '$transaction').mockImplementation(async (cb: any) => {
      return cb(prisma);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // =========================================================================
  // 1. STATUS LIFECYCLE & GENERATION PERMISSION
  // =========================================================================

  describe('Status Lifecycle & Shift Generation Gate', () => {
    test('LIFE-01: DRAFT job generates ZERO shifts', async () => {
      const job = createMockJob({ status: RecurringJobStatus.DRAFT });
      const result = await generator.generateForJob(job, { currentDate: '2026-10-01' });

      expect(result.generatedCount).toBe(0);
      expect(result.shifts).toHaveLength(0);
      expect(result.skippedReason).toBe('JOB_NOT_ACTIVE_DRAFT');
      expect(createdShiftsStore).toHaveLength(0);
      expect(updatedLastGeneratedUntil).toBeNull();
    });

    test('LIFE-01B: ACTIVE job generates occurrences up to rolling window', async () => {
      const job = createMockJob({ status: RecurringJobStatus.ACTIVE });
      const result = await generator.generateForJob(job, {
        currentDate: '2026-10-01',
        generationWindowDays: 5,
      });

      expect(result.generatedCount).toBe(6); // 2026-10-01 to 2026-10-06 inclusive
      expect(result.status).toBe(RecurringJobStatus.ACTIVE);
      expect(result.horizonEndDate).toBe('2026-10-06');
      expect(createdShiftsStore).toHaveLength(6);
      expect(updatedLastGeneratedUntil?.date.toISOString()).toBe('2026-10-06T00:00:00.000Z');
    });

    test('LIFE-02: PAUSED job generates ZERO new shifts', async () => {
      const job = createMockJob({ status: RecurringJobStatus.PAUSED });
      const result = await generator.generateForJob(job, { currentDate: '2026-10-01' });

      expect(result.generatedCount).toBe(0);
      expect(result.shifts).toHaveLength(0);
      expect(result.skippedReason).toBe('JOB_NOT_ACTIVE_PAUSED');
      expect(createdShiftsStore).toHaveLength(0);
    });

    test('CANCELLED job generates ZERO shifts', async () => {
      const job = createMockJob({ status: RecurringJobStatus.CANCELLED });
      const result = await generator.generateForJob(job, { currentDate: '2026-10-01' });

      expect(result.generatedCount).toBe(0);
      expect(result.skippedReason).toBe('JOB_NOT_ACTIVE_CANCELLED');
      expect(createdShiftsStore).toHaveLength(0);
    });

    test('COMPLETED job generates ZERO shifts', async () => {
      const job = createMockJob({ status: RecurringJobStatus.COMPLETED });
      const result = await generator.generateForJob(job, { currentDate: '2026-10-01' });

      expect(result.generatedCount).toBe(0);
      expect(result.skippedReason).toBe('JOB_NOT_ACTIVE_COMPLETED');
      expect(createdShiftsStore).toHaveLength(0);
    });
  });

  // =========================================================================
  // 2. ROLLING WINDOW & BOUNDARY CONDITIONS
  // =========================================================================

  describe('Rolling Generation Window & Horizon Boundaries', () => {
    test('30-day rolling window generates shifts from currentDate to currentDate + 30 days', async () => {
      const job = createMockJob();
      const result = await generator.generateForJob(job, {
        currentDate: '2026-10-01',
        generationWindowDays: 30,
      });

      expect(result.generatedCount).toBe(31); // Oct 1 through Oct 31 inclusive
      expect(result.horizonEndDate).toBe('2026-10-31');
      expect(result.shifts[0].occurrenceDate).toBe('2026-10-01');
      expect(result.shifts[result.shifts.length - 1].occurrenceDate).toBe('2026-10-31');
    });

    test('UT-REC-10: endDate limits generation horizon when earlier than window', async () => {
      const job = createMockJob({
        startDate: new Date('2026-10-01T00:00:00.000Z'),
        endDate: new Date('2026-10-07T00:00:00.000Z'),
      });
      const result = await generator.generateForJob(job, {
        currentDate: '2026-10-01',
        generationWindowDays: 30, // Window is 30 days, but endDate is Oct 7
      });

      expect(result.generatedCount).toBe(7); // Oct 1 through Oct 7
      expect(result.horizonEndDate).toBe('2026-10-07');
      expect(result.shifts[result.shifts.length - 1].occurrenceDate).toBe('2026-10-07');
    });

    test('startDate prevents historical generation when currentDate is after startDate', async () => {
      const job = createMockJob({
        startDate: new Date('2026-09-01T00:00:00.000Z'),
      });
      // Platform current date is Oct 1, 2026. Should NOT generate missed September shifts
      const result = await generator.generateForJob(job, {
        currentDate: '2026-10-01',
        generationWindowDays: 5,
      });

      expect(result.generatedCount).toBe(6); // Oct 1 to Oct 6
      expect(result.shifts[0].occurrenceDate).toBe('2026-10-01');
      expect(result.shifts.every((s) => s.occurrenceDate >= '2026-10-01')).toBe(true);
    });

    test('startDate in future starts generation from startDate rather than currentDate', async () => {
      const job = createMockJob({
        startDate: new Date('2026-10-10T00:00:00.000Z'),
      });
      // Current date is Oct 1, 2026
      const result = await generator.generateForJob(job, {
        currentDate: '2026-10-01',
        generationWindowDays: 15, // Window ends Oct 16
      });

      expect(result.generatedCount).toBe(7); // Oct 10 to Oct 16 inclusive
      expect(result.shifts[0].occurrenceDate).toBe('2026-10-10');
    });
  });

  // =========================================================================
  // 3. FREQUENCIES (DAILY, WEEKLY, MONTHLY)
  // =========================================================================

  describe('Recurrence Frequencies Integration', () => {
    test('Daily recurring generation with interval 2', async () => {
      const job = createMockJob({
        recurrenceFrequency: RecurrenceFrequency.DAILY,
        interval: 2,
        startDate: new Date('2026-10-01T00:00:00.000Z'),
      });
      const result = await generator.generateForJob(job, {
        currentDate: '2026-10-01',
        generationWindowDays: 6,
      });

      expect(result.generatedCount).toBe(4);
      expect(result.shifts.map((s) => s.occurrenceDate)).toEqual([
        '2026-10-01',
        '2026-10-03',
        '2026-10-05',
        '2026-10-07',
      ]);
    });

    test('Weekly recurring generation with anchor week rule (Mon, Fri)', async () => {
      const job = createMockJob({
        recurrenceFrequency: RecurrenceFrequency.WEEKLY,
        interval: 1,
        startDate: new Date('2026-10-01T00:00:00.000Z'), // Thursday
        byWeekdays: [1, 5], // Monday, Friday
      });
      const result = await generator.generateForJob(job, {
        currentDate: '2026-10-01',
        generationWindowDays: 10, // Oct 1 to Oct 11
      });

      expect(result.generatedCount).toBe(3);
      expect(result.shifts.map((s) => s.occurrenceDate)).toEqual([
        '2026-10-02', // Friday
        '2026-10-05', // Monday
        '2026-10-09', // Friday
      ]);
    });

    test('Monthly recurring generation with 31st last-day fallback', async () => {
      const job = createMockJob({
        recurrenceFrequency: RecurrenceFrequency.MONTHLY,
        interval: 1,
        startDate: new Date('2026-01-31T00:00:00.000Z'),
        byMonthDay: 31,
      });
      const result = await generator.generateForJob(job, {
        currentDate: '2026-01-31',
        generationWindowDays: 90, // Up to May 1
      });

      expect(result.generatedCount).toBe(4);
      expect(result.shifts.map((s) => s.occurrenceDate)).toEqual([
        '2026-01-31',
        '2026-02-28', // Fallback to Feb 28
        '2026-03-31',
        '2026-04-30', // Fallback to Apr 30
      ]);
    });
  });

  // =========================================================================
  // 4. TIMEZONE CONVERSION, DATE ALIGNMENT & OVERNIGHT SHIFTS
  // =========================================================================

  describe('Timezone, Overnight Shifts & Exact Date Alignment', () => {
    test('UT-TZ-02: Date alignment (shiftDate === occurrenceDate)', async () => {
      const job = createMockJob({
        startDate: new Date('2026-10-05T00:00:00.000Z'),
      });
      const result = await generator.generateForJob(job, {
        currentDate: '2026-10-05',
        generationWindowDays: 0,
      });

      expect(result.generatedCount).toBe(1);
      const shift = result.shifts[0];
      expect(shift.occurrenceDate).toBe('2026-10-05');
      expect(shift.shiftDate).toBe('2026-10-05');
      expect(shift.occurrenceDate).toBe(shift.shiftDate);
    });

    test('UT-TZ-04: Summer Time (BST, UTC+1) timestamp conversion', async () => {
      // 09:00 BST in Europe/London on 2026-06-15 maps to 08:00 UTC
      const job = createMockJob({
        timezone: 'Europe/London',
        startTimeOfDay: '09:00',
        endTimeOfDay: '17:00',
        startDate: new Date('2026-06-15T00:00:00.000Z'),
      });
      const result = await generator.generateForJob(job, {
        currentDate: '2026-06-15',
        generationWindowDays: 0,
      });

      const shift = result.shifts[0];
      expect(shift.startTime.toISOString()).toBe('2026-06-15T08:00:00.000Z');
      expect(shift.endTime.toISOString()).toBe('2026-06-15T16:00:00.000Z');
    });

    test('UT-TZ-03: Overnight shift (22:00 to 06:00 next day) preserves occurrenceDate and shiftDate', async () => {
      // Local 22:00 BST (21:00 UTC) on Oct 5 to 06:00 BST (05:00 UTC) on Oct 6
      const job = createMockJob({
        timezone: 'Europe/London',
        startTimeOfDay: '22:00',
        endTimeOfDay: '06:00', // Overnight because endTime <= startTime
        startDate: new Date('2026-10-05T00:00:00.000Z'),
      });
      const result = await generator.generateForJob(job, {
        currentDate: '2026-10-05',
        generationWindowDays: 0,
      });

      const shift = result.shifts[0];
      expect(shift.occurrenceDate).toBe('2026-10-05');
      expect(shift.shiftDate).toBe('2026-10-05');
      expect(shift.startTime.toISOString()).toBe('2026-10-05T21:00:00.000Z');
      expect(shift.endTime.toISOString()).toBe('2026-10-06T05:00:00.000Z');
    });

    test('3-Tier Timezone Fallback: Uses platform setting when job timezone is null', async () => {
      jest.spyOn(recurringJobRepository, 'getDefaultPlatformTimezone').mockResolvedValue('Africa/Nairobi');

      const job = createMockJob({
        timezone: null,
        startTimeOfDay: '09:00',
        endTimeOfDay: '17:00',
        startDate: new Date('2026-10-01T00:00:00.000Z'),
      });
      const result = await generator.generateForJob(job, {
        currentDate: '2026-10-01',
        generationWindowDays: 0,
      });

      // Africa/Nairobi is UTC+3 (09:00 EAT = 06:00 UTC)
      const shift = result.shifts[0];
      expect(shift.startTime.toISOString()).toBe('2026-10-01T06:00:00.000Z');
      expect(shift.endTime.toISOString()).toBe('2026-10-01T14:00:00.000Z');
    });
  });

  // =========================================================================
  // 5. FIELD MAPPING & SHIFT CODE GENERATION
  // =========================================================================

  describe('Field Mapping, Shift Code & Multiple Staff Semantics', () => {
    test('DB-IDEM-02: Length-Safe shiftCode format (RJXXXX-YYMMDD <= 20 chars)', async () => {
      const job = createMockJob({
        recurringJobCode: 'RJ0001',
        startDate: new Date('2026-10-05T00:00:00.000Z'),
      });
      const result = await generator.generateForJob(job, {
        currentDate: '2026-10-05',
        generationWindowDays: 0,
      });

      expect(result.createdShiftCodes[0]).toBe('RJ0001-261005');
      expect(result.createdShiftCodes[0].length).toBe(13);
      expect(result.createdShiftCodes[0].length).toBeLessThanOrEqual(20);
    });

    test('Generated Shift copies requiredWorkers, pay rate, role, location, currency', async () => {
      const job = createMockJob({
        requiredWorkers: 4,
        payRateHourly: new Prisma.Decimal('22.75'),
        currency: 'USD',
        jobRoleId: sampleRoleId,
        locationId: sampleLocationId,
        startDate: new Date('2026-10-01T00:00:00.000Z'),
      });
      const result = await generator.generateForJob(job, {
        currentDate: '2026-10-01',
        generationWindowDays: 0,
      });

      expect(result.shifts[0].requiredWorkers).toBe(4);
      expect(result.shifts[0].payRateHourly).toBe(22.75);
      expect(result.shifts[0].currency).toBe('USD');

      const rawShift = createdShiftsStore[0];
      expect(rawShift.jobRoleId).toBe(sampleRoleId);
      expect(rawShift.locationId).toBe(sampleLocationId);
      expect(rawShift.requiredWorkers).toBe(4);
      expect(rawShift.status).toBe(ShiftStatus.PUBLISHED);
      expect(rawShift.isOccurrenceOverride).toBe(false);
    });
  });

  // =========================================================================
  // 6. IDEMPOTENCY, REPETITION & TRANSACTION SAFETY
  // =========================================================================

  describe('DB-IDEM-03: Idempotency & Transaction Safety', () => {
    test('Repeated generator execution produces ZERO duplicate shifts and updates lastGeneratedUntil cleanly', async () => {
      const job = createMockJob({
        startDate: new Date('2026-10-01T00:00:00.000Z'),
      });

      // First run: generates 3 shifts (Oct 1, 2, 3)
      const run1 = await generator.generateForJob(job, {
        currentDate: '2026-10-01',
        generationWindowDays: 2,
      });
      expect(run1.generatedCount).toBe(3);
      expect(createdShiftsStore).toHaveLength(3);

      // Second run: same window
      const run2 = await generator.generateForJob(job, {
        currentDate: '2026-10-01',
        generationWindowDays: 2,
      });
      // Second run inserts 0 new shifts because they already exist
      expect(run2.generatedCount).toBe(0);
      expect(createdShiftsStore).toHaveLength(3); // Total remains 3
      expect(updatedLastGeneratedUntil?.date.toISOString()).toBe('2026-10-03T00:00:00.000Z');
    });

    test('Failed database transaction does NOT advance lastGeneratedUntil', async () => {
      const job = createMockJob();

      // Make createShiftOccurrences throw a database error
      jest.spyOn(recurringJobRepository, 'createShiftOccurrences').mockRejectedValueOnce(
        new Error('PostgreSQL Connection Failed')
      );

      await expect(
        generator.generateForJob(job, {
          currentDate: '2026-10-01',
          generationWindowDays: 5,
        })
      ).rejects.toThrow('PostgreSQL Connection Failed');

      expect(updatedLastGeneratedUntil).toBeNull();
    });

    test('Multiple recurring jobs generate independently and remain isolated', async () => {
      const job1 = createMockJob({ id: 'job-1', recurringJobCode: 'RJ0001', startDate: new Date('2026-10-01') });
      const job2 = createMockJob({ id: 'job-2', recurringJobCode: 'RJ0002', startDate: new Date('2026-10-01') });

      const res1 = await generator.generateForJob(job1, { currentDate: '2026-10-01', generationWindowDays: 1 });
      const res2 = await generator.generateForJob(job2, { currentDate: '2026-10-01', generationWindowDays: 1 });

      expect(res1.createdShiftCodes).toEqual(['RJ0001-261001', 'RJ0001-261002']);
      expect(res2.createdShiftCodes).toEqual(['RJ0002-261001', 'RJ0002-261002']);
      expect(createdShiftsStore).toHaveLength(4);
    });

    test('Existing one-time shifts (recurringJobId = null) are untouched by recurring generator', async () => {
      // Simulate existing one-time shift
      const oneTimeShift: Prisma.ShiftCreateManyInput = {
        shiftCode: 'SFT-9999',
        title: 'Ad-hoc event shift',
        jobRoleId: sampleRoleId,
        locationId: sampleLocationId,
        shiftDate: new Date('2026-10-01T00:00:00.000Z'),
        startTime: new Date('2026-10-01T08:00:00.000Z'),
        endTime: new Date('2026-10-01T16:00:00.000Z'),
        breakDurationMinutes: 0,
        payRateHourly: new Prisma.Decimal('18.00'),
        currency: 'GBP',
        requiredWorkers: 1,
        recurringJobId: null,
        occurrenceDate: null,
      };
      createdShiftsStore.push(oneTimeShift);

      const job = createMockJob({
        startDate: new Date('2026-10-01T00:00:00.000Z'),
      });
      await generator.generateForJob(job, { currentDate: '2026-10-01', generationWindowDays: 1 });

      // Total shifts = 1 one-time + 2 recurring
      expect(createdShiftsStore).toHaveLength(3);
      expect(createdShiftsStore[0].shiftCode).toBe('SFT-9999');
      expect(createdShiftsStore[0].recurringJobId).toBeNull();
    });
  });
});
