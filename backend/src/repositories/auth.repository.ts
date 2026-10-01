import { UserType } from '@prisma/client';
import { prisma } from '../config/database';

export class AuthRepository {
  /**
   * Find an AdminUser by email, including role assignments and permissions
   */
  async findAdminByEmail(email: string) {
    return prisma.adminUser.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Find an AdminUser by ID, including role assignments and permissions
   */
  async findAdminById(id: string) {
    return prisma.adminUser.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Find a Staff user by email or worker code
   */
  async findStaffByEmailOrWorkerCode(options: { email?: string; workerCode?: string }) {
    if (options.email) {
      return prisma.staff.findUnique({
        where: { email: options.email },
        include: {
          primaryRole: true,
        },
      });
    }

    if (options.workerCode) {
      return prisma.staff.findUnique({
        where: { workerCode: options.workerCode },
        include: {
          primaryRole: true,
        },
      });
    }

    return null;
  }

  /**
   * Find a Staff user by ID
   */
  async findStaffById(id: string) {
    return prisma.staff.findUnique({
      where: { id },
      include: {
        primaryRole: true,
      },
    });
  }

  /**
   * Create a new UserSession record in the database
   */
  async createSession(data: {
    id?: string;
    userType: UserType;
    adminUserId?: string;
    staffId?: string;
    refreshTokenHash: string;
    expiresAt: Date;
    deviceInfo?: string;
    ipAddress?: string;
  }) {
    return prisma.userSession.create({
      data: {
        id: data.id,
        userType: data.userType,
        adminUserId: data.adminUserId ?? null,
        staffId: data.staffId ?? null,
        refreshTokenHash: data.refreshTokenHash,
        expiresAt: data.expiresAt,
        deviceInfo: data.deviceInfo ?? null,
        ipAddress: data.ipAddress ?? null,
      },
    });
  }

  /**
   * Find a UserSession by its hashed refresh token
   */
  async findSessionByTokenHash(refreshTokenHash: string) {
    return prisma.userSession.findUnique({
      where: { refreshTokenHash },
      include: {
        adminUser: {
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        staff: true,
      },
    });
  }

  /**
   * Find a UserSession by ID
   */
  async findSessionById(id: string) {
    return prisma.userSession.findUnique({
      where: { id },
    });
  }

  /**
   * Mark a UserSession as revoked
   */
  async revokeSession(id: string) {
    return prisma.userSession.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Mark a UserSession as revoked by its refresh token hash
   */
  async revokeSessionByTokenHash(refreshTokenHash: string) {
    return prisma.userSession.update({
      where: { refreshTokenHash },
      data: { revokedAt: new Date() },
    });
  }
}

export const authRepository = new AuthRepository();
