/* eslint-disable @typescript-eslint/no-explicit-any */
import request from 'supertest';
import bcrypt from 'bcrypt';
import { app } from '../src/app';
import { authRepository } from '../src/repositories/auth.repository';
import { generateAccessToken, generateRefreshToken } from '../src/utils/jwt';
import { hashToken } from '../src/utils/crypto';
import { UserType } from '@prisma/client';

describe('Phase 1 Authentication & RBAC Test Suite', () => {
  const testPassword = 'SecurePassword123!';
  let passwordHash: string;

  const mockAdminId = '11111111-1111-1111-1111-111111111111';
  const mockStaffId = '22222222-2222-2222-2222-222222222222';
  const mockSessionId = '33333333-3333-3333-3333-333333333333';

  const mockAdminData = {
    id: mockAdminId,
    email: 'admin@usafi.com',
    passwordHash: '',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+254700000000',
    status: 'ACTIVE' as const,
    roles: [
      {
        role: {
          id: 'role-1',
          name: 'SuperAdmin',
          permissions: [
            { permission: { id: 'perm-1', code: 'staff.read', module: 'staff' } },
            { permission: { id: 'perm-2', code: 'staff.create', module: 'staff' } },
          ],
        },
      },
      {
        role: {
          id: 'role-2',
          name: 'OperationsManager',
          permissions: [
            { permission: { id: 'perm-3', code: 'staff.update', module: 'staff' } },
          ],
        },
      },
    ],
  };

  const mockStaffData = {
    id: mockStaffId,
    email: 'staff@usafi.com',
    workerCode: 'STF-1001',
    passwordHash: '',
    phone: '+254711111111',
    status: 'ACTIVE' as const,
    primaryRole: {
      id: 'job-role-1',
      title: 'Cleaner',
    },
  };

  beforeAll(async () => {
    passwordHash = await bcrypt.hash(testPassword, 10);
    mockAdminData.passwordHash = passwordHash;
    mockStaffData.passwordHash = passwordHash;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // 1. Successful admin login
  it('1. should successfully authenticate admin with valid credentials', async () => {
    jest.spyOn(authRepository, 'findAdminByEmail').mockResolvedValue(mockAdminData as any);
    jest.spyOn(authRepository, 'createSession').mockResolvedValue({
      id: mockSessionId,
      userType: UserType.ADMIN,
      adminUserId: mockAdminId,
      staffId: null,
      refreshTokenHash: 'hash',
      deviceInfo: null,
      ipAddress: null,
      expiresAt: new Date(Date.now() + 86400000),
      revokedAt: null,
      createdAt: new Date(),
    } as any);

    const res = await request(app).post('/api/v1/auth/admin/login').send({
      email: 'admin@usafi.com',
      password: testPassword,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('admin@usafi.com');
    expect(res.body.data.user.userType).toBe('ADMIN');
    expect(res.body.data.user.roles).toContain('SuperAdmin');
    expect(res.body.data.user.roles).toContain('OperationsManager');
    expect(res.body.data.user.permissions).toContain('staff.read');
    expect(res.body.data.user.permissions).toContain('staff.create');
    expect(res.body.data.user.permissions).toContain('staff.update');
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  // 2. Admin invalid credentials
  it('2. should reject admin login with invalid password', async () => {
    jest.spyOn(authRepository, 'findAdminByEmail').mockResolvedValue(mockAdminData as any);

    const res = await request(app).post('/api/v1/auth/admin/login').send({
      email: 'admin@usafi.com',
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid email or password');
  });

  // 3. Successful staff login
  it('3. should successfully authenticate staff with valid credentials', async () => {
    jest.spyOn(authRepository, 'findStaffByEmailOrWorkerCode').mockResolvedValue(mockStaffData as any);
    jest.spyOn(authRepository, 'createSession').mockResolvedValue({
      id: mockSessionId,
      userType: UserType.STAFF,
      adminUserId: null,
      staffId: mockStaffId,
      refreshTokenHash: 'hash',
      deviceInfo: null,
      ipAddress: null,
      expiresAt: new Date(Date.now() + 86400000),
      revokedAt: null,
      createdAt: new Date(),
    } as any);

    const res = await request(app).post('/api/v1/auth/staff/login').send({
      email: 'staff@usafi.com',
      password: testPassword,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('staff@usafi.com');
    expect(res.body.data.user.userType).toBe('STAFF');
    expect(res.body.data.user.permissions).toEqual([]);
    expect(res.body.data.accessToken).toBeDefined();
  });

  // 4. Staff invalid credentials
  it('4. should reject staff login with invalid credentials', async () => {
    jest.spyOn(authRepository, 'findStaffByEmailOrWorkerCode').mockResolvedValue(mockStaffData as any);

    const res = await request(app).post('/api/v1/auth/staff/login').send({
      email: 'staff@usafi.com',
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 5. Access token authentication
  it('5. should authenticate request with valid Bearer access token', async () => {
    const token = generateAccessToken({
      userId: mockAdminId,
      userType: UserType.ADMIN,
      email: 'admin@usafi.com',
      sessionId: mockSessionId,
    });

    jest.spyOn(authRepository, 'findSessionById').mockResolvedValue({
      id: mockSessionId,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 86400000),
    } as any);

    jest.spyOn(authRepository, 'findAdminById').mockResolvedValue(mockAdminData as any);

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('admin@usafi.com');
  });

  // 6. Invalid access token
  it('6. should reject request with invalid access token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid-token-string');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid or expired access token');
  });

  // 7. Expired/revoked session
  it('7. should reject access token if associated session is revoked', async () => {
    const token = generateAccessToken({
      userId: mockAdminId,
      userType: UserType.ADMIN,
      email: 'admin@usafi.com',
      sessionId: mockSessionId,
    });

    jest.spyOn(authRepository, 'findSessionById').mockResolvedValue({
      id: mockSessionId,
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 86400000),
    } as any);

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Session has been revoked or expired');
  });

  // 8. Refresh token success
  it('8. should successfully rotate tokens using a valid refresh token', async () => {
    const refreshToken = generateRefreshToken({
      userId: mockAdminId,
      userType: UserType.ADMIN,
      email: 'admin@usafi.com',
      sessionId: mockSessionId,
    });

    const tokenHash = hashToken(refreshToken);

    jest.spyOn(authRepository, 'findSessionByTokenHash').mockResolvedValue({
      id: mockSessionId,
      userType: UserType.ADMIN,
      adminUserId: mockAdminId,
      staffId: null,
      refreshTokenHash: tokenHash,
      expiresAt: new Date(Date.now() + 86400000),
      revokedAt: null,
      adminUser: mockAdminData,
    } as any);

    jest.spyOn(authRepository, 'revokeSession').mockResolvedValue({} as any);
    jest.spyOn(authRepository, 'createSession').mockResolvedValue({
      id: 'new-session-id',
    } as any);

    const res = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  // 9. Refresh token with revoked session
  it('9. should reject refresh token if session is revoked', async () => {
    const refreshToken = generateRefreshToken({
      userId: mockAdminId,
      userType: UserType.ADMIN,
      email: 'admin@usafi.com',
      sessionId: mockSessionId,
    });

    jest.spyOn(authRepository, 'findSessionByTokenHash').mockResolvedValue({
      id: mockSessionId,
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 86400000),
    } as any);

    const res = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken,
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Session has been revoked');
  });

  // 10. Logout/session revocation
  it('10. should successfully revoke session on logout', async () => {
    const refreshToken = generateRefreshToken({
      userId: mockAdminId,
      userType: UserType.ADMIN,
      email: 'admin@usafi.com',
      sessionId: mockSessionId,
    });

    const revokeSpy = jest.spyOn(authRepository, 'revokeSession').mockResolvedValue({} as any);

    jest.spyOn(authRepository, 'findSessionByTokenHash').mockResolvedValue({
      id: mockSessionId,
      revokedAt: null,
    } as any);

    const res = await request(app).post('/api/v1/auth/logout').send({
      refreshToken,
    });

    expect(res.status).toBe(200);
    expect(revokeSpy).toHaveBeenCalledWith(mockSessionId);
  });

  // 11. Admin permission granted
  it('11. should grant access to endpoint when admin has required permission', async () => {
    const token = generateAccessToken({
      userId: mockAdminId,
      userType: UserType.ADMIN,
      email: 'admin@usafi.com',
      sessionId: mockSessionId,
    });

    jest.spyOn(authRepository, 'findSessionById').mockResolvedValue({
      id: mockSessionId,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 86400000),
    } as any);

    jest.spyOn(authRepository, 'findAdminById').mockResolvedValue(mockAdminData as any);

    const res = await request(app)
      .get('/api/v1/test/staff-read')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Access granted to staff.read');
  });

  // 12. Admin permission denied
  it('12. should deny access to endpoint when admin lacks required permission', async () => {
    const token = generateAccessToken({
      userId: mockAdminId,
      userType: UserType.ADMIN,
      email: 'admin@usafi.com',
      sessionId: mockSessionId,
    });

    jest.spyOn(authRepository, 'findSessionById').mockResolvedValue({
      id: mockSessionId,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 86400000),
    } as any);

    jest.spyOn(authRepository, 'findAdminById').mockResolvedValue(mockAdminData as any);

    const res = await request(app)
      .get('/api/v1/test/staff-delete')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Forbidden');
  });

  // 13. Multiple roles resolving permissions correctly
  it('13. should resolve permissions correctly across multiple assigned roles', async () => {
    const token = generateAccessToken({
      userId: mockAdminId,
      userType: UserType.ADMIN,
      email: 'admin@usafi.com',
      sessionId: mockSessionId,
    });

    jest.spyOn(authRepository, 'findSessionById').mockResolvedValue({
      id: mockSessionId,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 86400000),
    } as any);

    jest.spyOn(authRepository, 'findAdminById').mockResolvedValue(mockAdminData as any);

    // staff.read comes from SuperAdmin role
    const resRead = await request(app)
      .get('/api/v1/test/staff-read')
      .set('Authorization', `Bearer ${token}`);
    expect(resRead.status).toBe(200);

    // staff.create comes from SuperAdmin role
    const resCreate = await request(app)
      .get('/api/v1/test/staff-create')
      .set('Authorization', `Bearer ${token}`);
    expect(resCreate.status).toBe(200);
  });

  // 14. Staff cannot access admin-only permission-protected functionality
  it('14. should deny staff access to admin-only permission endpoints', async () => {
    const token = generateAccessToken({
      userId: mockStaffId,
      userType: UserType.STAFF,
      email: 'staff@usafi.com',
      sessionId: mockSessionId,
    });

    jest.spyOn(authRepository, 'findSessionById').mockResolvedValue({
      id: mockSessionId,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 86400000),
    } as any);

    const res = await request(app)
      .get('/api/v1/test/staff-read')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden: Staff users do not have administrative permissions');
  });
});
