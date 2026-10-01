import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/apiError';
import { authService } from '../services/auth.service';
import { authRepository } from '../repositories/auth.repository';

/**
 * Authentication Middleware
 * Extracts and verifies Bearer access token, checks session status, and attaches identity to req.user.
 */
export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is missing or malformed');
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      throw ApiError.unauthorized('Invalid or expired access token');
    }

    // Check if session is revoked or expired if sessionId is attached
    if (decoded.sessionId) {
      const session = await authRepository.findSessionById(decoded.sessionId);
      if (!session || session.revokedAt || new Date() > new Date(session.expiresAt)) {
        throw ApiError.unauthorized('Session has been revoked or expired');
      }
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(ApiError.unauthorized('Invalid or expired access token'));
    }
  }
};

/**
 * RBAC Permission Middleware
 * Conceptually required usage: requirePermission("staff.read")
 * Ensures the authenticated user has the requested permission granted via any of their assigned roles.
 */
export const requirePermission = (permission: string | string[]) => {
  const requiredPermissions = Array.isArray(permission) ? permission : [permission];

  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('User context is missing');
      }

      // Staff users do not receive admin permissions
      if (req.user.userType !== 'ADMIN') {
        throw ApiError.forbidden('Forbidden: Staff users do not have administrative permissions');
      }

      // Resolve admin's permissions dynamically across all assigned roles
      const userPermissions = await authService.getAdminPermissions(req.user.userId);

      const hasPermission = requiredPermissions.some((perm) => userPermissions.includes(perm));

      if (!hasPermission) {
        throw ApiError.forbidden(`Forbidden: Lacks required permission [${requiredPermissions.join(', ')}]`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Role/UserType Restriction Middleware
 */
export const requireUserType = (allowedType: 'ADMIN' | 'STAFF') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('User context is missing'));
    }

    if (req.user.userType !== allowedType) {
      return next(ApiError.forbidden(`Forbidden: Requires ${allowedType} account access`));
    }

    next();
  };
};
