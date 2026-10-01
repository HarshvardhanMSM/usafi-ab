import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { authService } from '../services/auth.service';

/**
 * Middleware enforcing authorization for Staff & Profile APIs.
 * Supports Admin RBAC permission checks as well as Staff Self-Service profile access.
 */
export const authorizeStaffAccess = (permissionCode: string) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('User context is missing');
      }

      // Handle Admin Authorization
      if (req.user.userType === 'ADMIN') {
        const userPermissions = await authService.getAdminPermissions(req.user.userId);
        if (!userPermissions.includes(permissionCode)) {
          throw ApiError.forbidden(`Forbidden: Lacks required permission [${permissionCode}]`);
        }
        return next();
      }

      // Handle Staff Self-Service Authorization
      if (req.user.userType === 'STAFF') {
        // Staff cannot list, create, or delete staff members
        if (permissionCode === 'staff.create' || permissionCode === 'staff.delete') {
          throw ApiError.forbidden('Forbidden: Staff members cannot perform this administrative action');
        }

        const paramId = req.params.id || req.params.staffId;
        
        // If paramId is 'me', resolve it to the authenticated staff ID
        if (paramId === 'me' || paramId === req.user.userId) {
          return next();
        }

        // Staff attempting to access another staff member's profile
        throw ApiError.forbidden('Forbidden: Staff members cannot access another staff member\'s profile');
      }

      throw ApiError.forbidden('Forbidden: Unknown account user type');
    } catch (error) {
      next(error);
    }
  };
};
