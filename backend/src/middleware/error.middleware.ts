import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { sendError } from '../utils/response';
import { ErrorCodes } from '../constants/errorCodes';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const globalErrorHandler = (
  err: Error | ApiError | Record<string, unknown> | unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error(`Error processing request: ${req.method} ${req.originalUrl}`, err);

  // Handle custom ApiError
  if (err instanceof ApiError) {
    sendError(res, err.message, err.statusCode, err.errorCode, err.details);
    return;
  }

  const errorObj = err as Record<string, unknown> | null;

  // Handle Prisma Known Request Errors
  if (errorObj && typeof errorObj.code === 'string' && errorObj.code.startsWith('P')) {
    let message: string;
    let statusCode = 400;

    switch (errorObj.code) {
      case 'P2002':
        message = 'A record with this unique field already exists';
        statusCode = 409;
        break;
      case 'P2025':
        message = 'Record to update or delete not found';
        statusCode = 404;
        break;
      default:
        message = `Database operation failed (${errorObj.code})`;
        break;
    }

    sendError(
      res,
      message,
      statusCode,
      ErrorCodes.DATABASE_ERROR,
      env.NODE_ENV === 'development'
        ? { prismaCode: errorObj.code, meta: errorObj.meta }
        : undefined,
    );
    return;
  }

  // Handle Prisma Validation Error
  if (errorObj?.name === 'PrismaClientValidationError') {
    sendError(
      res,
      'Invalid data provided for database operation',
      400,
      ErrorCodes.VALIDATION_ERROR,
      env.NODE_ENV === 'development' ? { details: errorObj.message } : undefined,
    );
    return;
  }

  // Handle syntax/JSON parse errors
  if (
    err instanceof SyntaxError &&
    'status' in err &&
    (err as { status?: number }).status === 400
  ) {
    sendError(res, 'Malformed JSON payload', 400, ErrorCodes.BAD_REQUEST);
    return;
  }

  // Generic internal server error fallback
  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred'
      : (err as Error)?.message || 'Internal server error';

  sendError(res, message, 500, ErrorCodes.INTERNAL_SERVER_ERROR);
};
