import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/apiError';

export class AuthController {
  /**
   * Admin Login Controller
   */
  async adminLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deviceInfo = (req.headers['user-agent'] as string) || undefined;
      const ipAddress = req.ip || undefined;

      const result = await authService.adminLogin(req.body, deviceInfo, ipAddress);
      sendSuccess(res, 'Admin authenticated successfully', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Staff Login Controller
   */
  async staffLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deviceInfo = (req.headers['user-agent'] as string) || undefined;
      const ipAddress = req.ip || undefined;

      const result = await authService.staffLogin(req.body, deviceInfo, ipAddress);
      sendSuccess(res, 'Staff authenticated successfully', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh Token Controller
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      sendSuccess(res, 'Tokens refreshed successfully', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout Controller
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.body?.refreshToken;
      const sessionId = req.user?.sessionId;

      await authService.logout(refreshToken, sessionId);
      sendSuccess(res, 'Logged out successfully', null, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Current Authenticated Profile Controller
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('User context is missing');
      }

      const user = await authService.getMe(req.user.userId, req.user.userType);
      sendSuccess(res, 'Authenticated user profile retrieved', user, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
