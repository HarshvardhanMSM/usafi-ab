import { ErrorCode } from '../constants/errorCodes';

export interface ApiResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorDetails {
  code: ErrorCode | string;
  details?: Record<string, unknown> | unknown[];
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: ApiErrorDetails;
}

export interface AuthUserPayload {
  userId: string;
  userType: 'ADMIN' | 'STAFF';
  email: string;
  sessionId: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: unknown;
}

