import crypto from 'crypto';
import { UserType } from '@prisma/client';
import { authRepository } from '../repositories/auth.repository';
import { comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { hashToken } from '../utils/crypto';
import { parseDurationMs } from '../utils/time';
import { env } from '../config/env';
import { ApiError } from '../utils/apiError';
import { AdminLoginInput, StaffLoginInput } from '../validators/auth.validator';
import { LoginResult, RefreshResult, AuthenticatedUser } from '../types/auth.types';

export class AuthService {
  /**
   * Helper to resolve unique permissions and role names for an admin user
   */
  public resolveAdminPermissionsAndRoles(admin: Record<string, unknown> | null | undefined) {
    const roles: string[] = [];
    const permissionSet = new Set<string>();

    if (admin && admin.roles && Array.isArray(admin.roles)) {
      for (const userRole of admin.roles) {
        if (userRole.role) {
          roles.push(userRole.role.name);
          if (userRole.role.permissions && Array.isArray(userRole.role.permissions)) {
            for (const rp of userRole.role.permissions) {
              if (rp.permission && rp.permission.code) {
                permissionSet.add(rp.permission.code);
              }
            }
          }
        }
      }
    }

    return {
      roles,
      permissions: Array.from(permissionSet),
    };
  }

  /**
   * Authenticate Admin user and create session
   */
  async adminLogin(
    input: AdminLoginInput,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<LoginResult> {
    const admin = await authRepository.findAdminByEmail(input.email);

    // Use generic error message to prevent account enumeration
    if (!admin || admin.status !== 'ACTIVE') {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(input.password, admin.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const { roles, permissions } = this.resolveAdminPermissionsAndRoles(admin);

    const refreshDurationMs = parseDurationMs(env.JWT_REFRESH_EXPIRES_IN);
    const expiresAt = new Date(Date.now() + refreshDurationMs);
    const sessionId = crypto.randomUUID();

    const tokenPayload = {
      userId: admin.id,
      userType: UserType.ADMIN,
      email: admin.email,
      sessionId,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    const refreshTokenHash = hashToken(refreshToken);

    await authRepository.createSession({
      id: sessionId,
      userType: UserType.ADMIN,
      adminUserId: admin.id,
      refreshTokenHash,
      expiresAt,
      deviceInfo,
      ipAddress,
    });

    const authenticatedUser: AuthenticatedUser = {
      id: admin.id,
      email: admin.email,
      userType: UserType.ADMIN,
      firstName: admin.firstName,
      lastName: admin.lastName,
      phone: admin.phone,
      status: admin.status,
      roles,
      permissions,
    };

    return {
      user: authenticatedUser,
      accessToken,
      refreshToken,
      expiresAt,
    };
  }

  /**
   * Authenticate Staff user and create session
   */
  async staffLogin(
    input: StaffLoginInput,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<LoginResult> {
    const staff = await authRepository.findStaffByEmailOrWorkerCode({
      email: input.email,
      workerCode: input.workerCode,
    });

    if (!staff || staff.status === 'SUSPENDED') {
      throw ApiError.unauthorized('Invalid email/worker code or password');
    }

    const isPasswordValid = await comparePassword(input.password, staff.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email/worker code or password');
    }

    const refreshDurationMs = parseDurationMs(env.JWT_REFRESH_EXPIRES_IN);
    const expiresAt = new Date(Date.now() + refreshDurationMs);
    const sessionId = crypto.randomUUID();

    const tokenPayload = {
      userId: staff.id,
      userType: UserType.STAFF,
      email: staff.email,
      sessionId,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    const refreshTokenHash = hashToken(refreshToken);

    await authRepository.createSession({
      id: sessionId,
      userType: UserType.STAFF,
      staffId: staff.id,
      refreshTokenHash,
      expiresAt,
      deviceInfo,
      ipAddress,
    });

    const authenticatedUser: AuthenticatedUser = {
      id: staff.id,
      email: staff.email,
      userType: UserType.STAFF,
      firstName: '',
      lastName: '',
      workerCode: staff.workerCode,
      phone: staff.phone,
      status: staff.status,
      roles: staff.primaryRole ? [staff.primaryRole.title] : [],
      permissions: [], // Staff users do not receive admin permissions
    };

    return {
      user: authenticatedUser,
      accessToken,
      refreshToken,
      expiresAt,
    };
  }

  /**
   * Refresh Token Flow: Validates refresh token, checks session, and rotates tokens securely
   */
  async refreshToken(rawRefreshToken: string): Promise<RefreshResult> {
    if (!rawRefreshToken) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    let payload;
    try {
      payload = verifyRefreshToken(rawRefreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const hashedToken = hashToken(rawRefreshToken);
    const session = await authRepository.findSessionByTokenHash(hashedToken);

    if (!session) {
      throw ApiError.unauthorized('Invalid refresh token session');
    }

    if (session.revokedAt) {
      throw ApiError.unauthorized('Session has been revoked');
    }

    if (new Date() > new Date(session.expiresAt)) {
      throw ApiError.unauthorized('Session has expired');
    }

    // Verify user identity & status
    if (session.userType === UserType.ADMIN) {
      if (!session.adminUser || session.adminUser.status !== 'ACTIVE') {
        throw ApiError.unauthorized('Account is disabled or no longer exists');
      }
    } else if (session.userType === UserType.STAFF) {
      if (!session.staff || session.staff.status === 'SUSPENDED') {
        throw ApiError.unauthorized('Account is suspended or no longer exists');
      }
    }

    // Revoke old session for security (Token Rotation)
    await authRepository.revokeSession(session.id);

    // Generate new tokens and session
    const refreshDurationMs = parseDurationMs(env.JWT_REFRESH_EXPIRES_IN);
    const expiresAt = new Date(Date.now() + refreshDurationMs);
    const newSessionId = crypto.randomUUID();

    const newPayload = {
      userId: payload.userId,
      userType: session.userType,
      email: payload.email,
      sessionId: newSessionId,
    };

    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);
    const newRefreshTokenHash = hashToken(newRefreshToken);

    await authRepository.createSession({
      id: newSessionId,
      userType: session.userType,
      adminUserId: session.adminUserId ?? undefined,
      staffId: session.staffId ?? undefined,
      refreshTokenHash: newRefreshTokenHash,
      expiresAt,
      deviceInfo: session.deviceInfo ?? undefined,
      ipAddress: session.ipAddress ?? undefined,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt,
    };
  }

  /**
   * Logout user by revoking the UserSession
   */
  async logout(rawRefreshToken?: string, sessionId?: string): Promise<void> {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      const session = await authRepository.findSessionByTokenHash(tokenHash);
      if (session && !session.revokedAt) {
        await authRepository.revokeSession(session.id);
        return;
      }
    }

    if (sessionId) {
      const session = await authRepository.findSessionById(sessionId);
      if (session && !session.revokedAt) {
        await authRepository.revokeSession(sessionId);
        return;
      }
    }
  }

  /**
   * Get current authenticated user profile
   */
  async getMe(userId: string, userType: UserType): Promise<AuthenticatedUser> {
    if (userType === UserType.ADMIN) {
      const admin = await authRepository.findAdminById(userId);
      if (!admin || admin.status !== 'ACTIVE') {
        throw ApiError.unauthorized('User not found or account inactive');
      }

      const { roles, permissions } = this.resolveAdminPermissionsAndRoles(admin);

      return {
        id: admin.id,
        email: admin.email,
        userType: UserType.ADMIN,
        firstName: admin.firstName,
        lastName: admin.lastName,
        phone: admin.phone,
        status: admin.status,
        roles,
        permissions,
      };
    } else {
      const staff = await authRepository.findStaffById(userId);
      if (!staff || staff.status === 'SUSPENDED') {
        throw ApiError.unauthorized('User not found or account suspended');
      }

      return {
        id: staff.id,
        email: staff.email,
        userType: UserType.STAFF,
        firstName: '',
        lastName: '',
        workerCode: staff.workerCode,
        phone: staff.phone,
        status: staff.status,
        roles: staff.primaryRole ? [staff.primaryRole.title] : [],
        permissions: [],
      };
    }
  }

  /**
   * Get all permissions for a given Admin User ID
   */
  async getAdminPermissions(adminUserId: string): Promise<string[]> {
    const admin = await authRepository.findAdminById(adminUserId);
    if (!admin) return [];

    const { permissions } = this.resolveAdminPermissionsAndRoles(admin);
    return permissions;
  }
}

export const authService = new AuthService();
