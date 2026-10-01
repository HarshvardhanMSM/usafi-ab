import crypto from 'crypto';

/**
 * Hashes a refresh token string using SHA-256 for secure database storage.
 * Deterministic hashing enables unique lookup on UserSession.refreshTokenHash.
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
