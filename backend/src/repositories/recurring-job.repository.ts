import { Prisma, RecurringJob, RecurringJobStatus } from '@prisma/client';
import { prisma } from '../config/database';

export class RecurringJobRepository {
  /**
   * Find a RecurringJob by ID with optional transaction client.
   */
  async findById(id: string, tx?: Prisma.TransactionClient): Promise<RecurringJob | null> {
    const client = tx ?? prisma;
    return client.recurringJob.findUnique({
      where: { id },
    });
  }

  /**
   * Find a RecurringJob by its unique code.
   */
  async findByCode(recurringJobCode: string, tx?: Prisma.TransactionClient): Promise<RecurringJob | null> {
    const client = tx ?? prisma;
    return client.recurringJob.findUnique({
      where: { recurringJobCode },
    });
  }

  /**
   * Find all currently ACTIVE recurring jobs.
   */
  async findActiveJobs(tx?: Prisma.TransactionClient): Promise<RecurringJob[]> {
    const client = tx ?? prisma;
    return client.recurringJob.findMany({
      where: {
        status: RecurringJobStatus.ACTIVE,
      },
    });
  }

  /**
   * Update lastGeneratedUntil for a recurring job.
   */
  async updateLastGeneratedUntil(
    id: string,
    lastGeneratedUntil: Date,
    tx?: Prisma.TransactionClient
  ): Promise<RecurringJob> {
    const client = tx ?? prisma;
    return client.recurringJob.update({
      where: { id },
      data: {
        lastGeneratedUntil,
      },
    });
  }

  /**
   * Reads a SystemSetting value by key with optional default fallback.
   */
  async getSystemSetting(key: string, defaultValue?: string, tx?: Prisma.TransactionClient): Promise<string | null> {
    const client = tx ?? prisma;
    const setting = await client.systemSettings.findUnique({
      where: { key },
    });
    return setting ? setting.value : defaultValue ?? null;
  }

  /**
   * Retrieves integer generation window days from system settings.
   */
  async getGenerationWindowDays(tx?: Prisma.TransactionClient): Promise<number> {
    const settingValue = await this.getSystemSetting('RECURRING_JOB_GENERATION_WINDOW_DAYS', '30', tx);
    const parsed = parseInt(settingValue ?? '30', 10);
    return isNaN(parsed) || parsed < 1 ? 30 : parsed;
  }

  /**
   * Retrieves default platform timezone from system settings.
   */
  async getDefaultPlatformTimezone(tx?: Prisma.TransactionClient): Promise<string> {
    const settingValue = await this.getSystemSetting('DEFAULT_PLATFORM_TIMEZONE', 'UTC', tx);
    return settingValue && settingValue.trim().length > 0 ? settingValue.trim() : 'UTC';
  }

  /**
   * Inserts shift occurrences idempotently using createMany with skipDuplicates.
   */
  async createShiftOccurrences(
    shiftsData: Prisma.ShiftCreateManyInput[],
    tx?: Prisma.TransactionClient
  ): Promise<number> {
    if (shiftsData.length === 0) {
      return 0;
    }
    const client = tx ?? prisma;
    const result = await client.shift.createMany({
      data: shiftsData,
      skipDuplicates: true,
    });
    return result.count;
  }

  /**
   * Find existing occurrence dates for a recurring job within candidate dates.
   */
  async findExistingOccurrences(
    recurringJobId: string,
    occurrenceDates: Date[],
    tx?: Prisma.TransactionClient
  ): Promise<Date[]> {
    if (occurrenceDates.length === 0) return [];
    const client = tx ?? prisma;
    const existing = await client.shift.findMany({
      where: {
        recurringJobId,
        occurrenceDate: { in: occurrenceDates },
      },
      select: { occurrenceDate: true },
    });
    return existing
      .map((s) => s.occurrenceDate)
      .filter((d): d is Date => d !== null);
  }
}

export const recurringJobRepository = new RecurringJobRepository();
