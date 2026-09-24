import { Response } from 'express';
import { ApiResponse, ApiErrorResponse } from '../types/api.types';
import { ErrorCode, ErrorCodes } from '../constants/errorCodes';

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data: T,
  statusCode = 200,
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  code: ErrorCode = ErrorCodes.BAD_REQUEST,
  details?: Record<string, unknown> | unknown[],
): Response => {
  const response: ApiErrorResponse = {
    success: false,
    message,
    error: {
      code,
      ...(details ? { details } : {}),
    },
  };
  return res.status(statusCode).json(response);
};
