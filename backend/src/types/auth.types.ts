import { UserType } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  userType: UserType;
  email: string;
  sessionId: string;
}

export interface AdminUserWithRolesPermissions {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  status: string;
  roles: {
    role: {
      id: string;
      name: string;
      permissions: {
        permission: {
          id: string;
          code: string;
          module: string;
        };
      }[];
    };
  }[];
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  userType: UserType;
  firstName: string;
  lastName: string;
  workerCode?: string;
  phone?: string | null;
  status: string;
  roles?: string[];
  permissions?: string[];
}

export interface LoginResult {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}
