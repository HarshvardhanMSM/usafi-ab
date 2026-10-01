import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

export const staffLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address format').optional(),
  workerCode: z.string().trim().optional(),
  password: z.string().min(1, 'Password is required'),
}).refine((data) => data.email || data.workerCode, {
  message: 'Either email or workerCode must be provided',
  path: ['email'],
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type StaffLoginInput = z.infer<typeof staffLoginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
