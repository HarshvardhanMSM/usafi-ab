import { ErrorCode, ErrorCodes } from '../constants/errorCodes';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly details?: Record<string, unknown> | unknown[];

  constructor(
    statusCode: number,
    message: string,
    errorCode: ErrorCode = ErrorCodes.INTERNAL_SERVER_ERROR,
    details?: Record<string, unknown> | unknown[],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: Record<string, unknown> | unknown[]): ApiError {
    return new ApiError(400, message, ErrorCodes.BAD_REQUEST, details);
  }

  static validationError(message: string, details?: Record<string, unknown> | unknown[]): ApiError {
    return new ApiError(400, message, ErrorCodes.VALIDATION_ERROR, details);
  } 

  static unauthorized(message = 'Authentication required'): ApiError {
    return new ApiError(401, message, ErrorCodes.AUTHENTICATION_ERROR);
  }

  static forbidden(message = 'Access denied'): ApiError {
    return new ApiError(403, message, ErrorCodes.AUTHORIZATION_ERROR);
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, message, ErrorCodes.NOT_FOUND);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message, ErrorCodes.CONFLICT);
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(500, message, ErrorCodes.INTERNAL_SERVER_ERROR);
  }
}
