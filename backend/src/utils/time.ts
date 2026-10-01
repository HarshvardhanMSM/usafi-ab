/**
 * Parses a duration string (e.g. '7d', '15m', '24h', '30s') into milliseconds.
 */
export const parseDurationMs = (duration: string): number => {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    // Default fallback to 7 days if unparseable
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
};
