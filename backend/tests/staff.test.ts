/* eslint-disable @typescript-eslint/no-explicit-any */
import request from 'supertest';
import { app } from '../src/app';
import { staffRepository } from '../src/repositories/staff.repository';
import { authRepository } from '../src/repositories/auth.repository';
import { generateAccessToken } from '../src/utils/jwt';
import { UserType, StaffStatus, Gender, FitnessStatus, BankVerificationStatus, ReferenceVerificationStatus } from '@prisma/client';

describe('Phase 2 Staff & Profile APIs Test Suite', () => {
  const mockAdminId = '11111111-1111-1111-1111-111111111111';
  const mockStaffId = '22222222-2222-2222-2222-222222222222';
  const otherStaffId = '33333333-3333-3333-3333-333333333333';
  const mockSessionId = '44444444-4444-4444-4444-444444444444';

  const mockAdminToken = generateAccessToken({
    userId: mockAdminId,
    userType: UserType.ADMIN,
    email: 'admin@usafi.com',
    sessionId: mockSessionId,
  });

  const mockStaffToken = generateAccessToken({
    userId: mockStaffId,
    userType: UserType.STAFF,
    email: 'staff@usafi.com',
    sessionId: mockSessionId,
  });

  const mockAdminUser = {
    id: mockAdminId,
    email: 'admin@usafi.com',
    status: 'ACTIVE',
    roles: [
      {
        role: {
          id: 'r1',
          name: 'SuperAdmin',
          permissions: [
            { permission: { id: 'p1', code: 'staff.read', module: 'staff' } },
            { permission: { id: 'p2', code: 'staff.create', module: 'staff' } },
            { permission: { id: 'p3', code: 'staff.update', module: 'staff' } },
            { permission: { id: 'p4', code: 'staff.delete', module: 'staff' } },
          ],
        },
      },
    ],
  };

  const mockStaffRecord = {
    id: mockStaffId,
    workerCode: 'STF-1001',
    email: 'staff@usafi.com',
    phone: '+254700000000',
    passwordHash: '$2b$10$hashed',
    status: StaffStatus.ACTIVE,
    avatarUrl: 'https://example.com/avatar.jpg',
    primaryRoleId: null,
    pushToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    primaryRole: null,
    personalDetails: {
      id: 'pd-1',
      staffId: mockStaffId,
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1995-05-15'),
      gender: Gender.MALE,
      nationality: 'Kenyan',
      niNumber: 'NI123456',
      utrNumber: 'UTR123456',
      addressLine1: '123 Main St',
      addressLine2: null,
      city: 'Nairobi',
      postcode: '00100',
      country: 'Kenya',
      updatedAt: new Date(),
    },
    healthInformation: null,
    bankDetails: null,
    nextOfKin: null,
    qualifications: [],
    employmentReferences: [],
    staffContract: null,
  };

  beforeEach(() => {
    jest.restoreAllMocks();

    // Default mock for session lookup in auth middleware
    jest.spyOn(authRepository, 'findSessionById').mockResolvedValue({
      id: mockSessionId,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 86400000),
    } as any);

    // Default mock for admin lookup in permission middleware
    jest.spyOn(authRepository, 'findAdminById').mockResolvedValue(mockAdminUser as any);
  });

  // 1. Staff list success
  it('1. should retrieve paginated staff list for authorized admin', async () => {
    jest.spyOn(staffRepository, 'findMany').mockResolvedValue({
      items: [mockStaffRecord as any],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });

    const res = await request(app)
      .get('/api/v1/staff?page=1&limit=20')
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].passwordHash).toBeUndefined(); // Sensitive field sanitized
  });

  // 2. Staff detail success
  it('2. should retrieve full staff details by ID', async () => {
    jest.spyOn(staffRepository, 'findById').mockResolvedValue(mockStaffRecord as any);

    const res = await request(app)
      .get(`/api/v1/staff/${mockStaffId}`)
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(mockStaffId);
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  // 3. Staff create success
  it('3. should create new staff member atomically with personalDetails', async () => {
    jest.spyOn(staffRepository, 'findByWorkerCode').mockResolvedValue(null);
    jest.spyOn(staffRepository, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(staffRepository, 'findByPhone').mockResolvedValue(null);
    jest.spyOn(staffRepository, 'create').mockResolvedValue(mockStaffRecord as any);

    const newStaffData = {
      workerCode: 'STF-1002',
      email: 'newstaff@usafi.com',
      phone: '+254711223344',
      password: 'Password123!',
      status: StaffStatus.PENDING_ONBOARDING,
      personalDetails: {
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '1998-08-20',
        gender: Gender.FEMALE,
        addressLine1: '456 West Rd',
        city: 'Nairobi',
        postcode: '00200',
        country: 'Kenya',
      },
    };

    const res = await request(app)
      .post('/api/v1/staff')
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send(newStaffData);

    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe('staff@usafi.com');
  });

  // 4. Staff update success
  it('4. should update staff member profile details', async () => {
    jest.spyOn(staffRepository, 'findById').mockResolvedValue(mockStaffRecord as any);
    jest.spyOn(staffRepository, 'update').mockResolvedValue({
      ...mockStaffRecord,
      phone: '+254799887766',
    } as any);

    const res = await request(app)
      .patch(`/api/v1/staff/${mockStaffId}`)
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({ phone: '+254799887766' });

    expect(res.status).toBe(200);
    expect(res.body.data.phone).toBe('+254799887766');
  });

  // 5. Invalid staff ID
  it('5. should return 404 for non-existent staff ID', async () => {
    jest.spyOn(staffRepository, 'findById').mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/v1/staff/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Staff member not found');
  });

  // 6. Missing required fields
  it('6. should reject creation when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/staff')
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({
        email: 'incomplete@usafi.com',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // 7. Invalid field values
  it('7. should reject invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/staff')
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({
        workerCode: 'STF-99',
        email: 'invalid-email-address',
        phone: '+254700000000',
        password: 'Pass123!',
      });

    expect(res.status).toBe(400);
  });

  // 8. Duplicate/conflicting staff data
  it('8. should return 409 conflict when workerCode already exists', async () => {
    jest.spyOn(staffRepository, 'findByWorkerCode').mockResolvedValue(mockStaffRecord as any);

    const res = await request(app)
      .post('/api/v1/staff')
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({
        workerCode: 'STF-1001',
        email: 'unique@usafi.com',
        phone: '+254788888888',
        password: 'Password123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('already registered');
  });

  // 9. PersonalDetails create/update
  it('9. should upsert PersonalDetails entity', async () => {
    jest.spyOn(staffRepository, 'findById').mockResolvedValue(mockStaffRecord as any);
    jest.spyOn(staffRepository, 'upsertPersonalDetails').mockResolvedValue(mockStaffRecord.personalDetails as any);

    const pdData = {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1995-05-15',
      gender: Gender.MALE,
      addressLine1: '123 Main St',
      city: 'Nairobi',
      postcode: '00100',
      country: 'Kenya',
    };

    const res = await request(app)
      .put(`/api/v1/staff/${mockStaffId}/personal-details`)
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send(pdData);

    expect(res.status).toBe(200);
    expect(res.body.data.firstName).toBe('John');
  });

  // 10. HealthInformation create/update
  it('10. should upsert HealthInformation entity', async () => {
    jest.spyOn(staffRepository, 'findById').mockResolvedValue(mockStaffRecord as any);
    jest.spyOn(staffRepository, 'upsertHealthInformation').mockResolvedValue({
      id: 'hi-1',
      staffId: mockStaffId,
      fitnessStatus: FitnessStatus.FIT_FOR_WORK,
      bloodGroup: 'O+',
      emergencyContactName: 'Mary Doe',
      emergencyContactPhone: '+254722334455',
      allergiesMedicalNotes: null,
      disabilityAccommodations: null,
      updatedAt: new Date(),
    } as any);

    const healthData = {
      fitnessStatus: FitnessStatus.FIT_FOR_WORK,
      bloodGroup: 'O+',
      emergencyContactName: 'Mary Doe',
      emergencyContactPhone: '+254722334455',
    };

    const res = await request(app)
      .put(`/api/v1/staff/${mockStaffId}/health-information`)
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send(healthData);

    expect(res.status).toBe(200);
    expect(res.body.data.fitnessStatus).toBe(FitnessStatus.FIT_FOR_WORK);
  });

  // 11. BankDetails create/update
  it('11. should upsert BankDetails entity', async () => {
    jest.spyOn(staffRepository, 'findById').mockResolvedValue(mockStaffRecord as any);
    jest.spyOn(staffRepository, 'upsertBankDetails').mockResolvedValue({
      id: 'bd-1',
      staffId: mockStaffId,
      accountHolderName: 'John Doe',
      bankName: 'KCB Bank',
      sortCodeEncrypted: 'encrypted-sort-code',
      accountNumberEncrypted: 'encrypted-account-num',
      verificationStatus: BankVerificationStatus.VERIFIED,
      updatedAt: new Date(),
    } as any);

    const bankData = {
      accountHolderName: 'John Doe',
      bankName: 'KCB Bank',
      sortCodeEncrypted: 'encrypted-sort-code',
      accountNumberEncrypted: 'encrypted-account-num',
    };

    const res = await request(app)
      .put(`/api/v1/staff/${mockStaffId}/bank-details`)
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send(bankData);

    expect(res.status).toBe(200);
    expect(res.body.data.bankName).toBe('KCB Bank');
  });

  // 12. NextOfKin create/update
  it('12. should upsert NextOfKin entity', async () => {
    jest.spyOn(staffRepository, 'findById').mockResolvedValue(mockStaffRecord as any);
    jest.spyOn(staffRepository, 'upsertNextOfKin').mockResolvedValue({
      id: 'nok-1',
      staffId: mockStaffId,
      fullName: 'Sarah Doe',
      relationship: 'Spouse',
      phone: '+254733445566',
      email: 'sarah@example.com',
      address: '123 Main St',
      updatedAt: new Date(),
    } as any);

    const nokData = {
      fullName: 'Sarah Doe',
      relationship: 'Spouse',
      phone: '+254733445566',
    };

    const res = await request(app)
      .put(`/api/v1/staff/${mockStaffId}/next-of-kin`)
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send(nokData);

    expect(res.status).toBe(200);
    expect(res.body.data.fullName).toBe('Sarah Doe');
  });

  // 13. Qualification create/update
  it('13. should create and update Qualification entity', async () => {
    jest.spyOn(staffRepository, 'findById').mockResolvedValue(mockStaffRecord as any);
    jest.spyOn(staffRepository, 'createQualification').mockResolvedValue({
      id: 'qual-1',
      staffId: mockStaffId,
      title: 'BSc Computer Science',
      highestEducationLevel: 'Bachelor Degree',
      yearsOfExperience: 3,
      specializedCertifications: 'OSHA Safety',
      issueDate: new Date('2020-01-01'),
      expiryDate: null,
      certificateDocumentUrl: null,
    } as any);

    const qualData = {
      title: 'BSc Computer Science',
      highestEducationLevel: 'Bachelor Degree',
      yearsOfExperience: 3,
    };

    const res = await request(app)
      .post(`/api/v1/staff/${mockStaffId}/qualifications`)
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send(qualData);

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('BSc Computer Science');
  });

  // 14. EmploymentReference create/update
  it('14. should create and update EmploymentReference entity', async () => {
    jest.spyOn(staffRepository, 'findById').mockResolvedValue(mockStaffRecord as any);
    jest.spyOn(staffRepository, 'createEmploymentReference').mockResolvedValue({
      id: 'ref-1',
      staffId: mockStaffId,
      companyName: 'Acme Services Ltd',
      supervisorName: 'Robert Johnson',
      supervisorPhone: '+254744556677',
      supervisorEmail: 'robert@acme.com',
      jobTitle: 'Senior Cleaner',
      verificationStatus: ReferenceVerificationStatus.VERIFIED,
    } as any);

    const refData = {
      companyName: 'Acme Services Ltd',
      supervisorName: 'Robert Johnson',
      supervisorPhone: '+254744556677',
    };

    const res = await request(app)
      .post(`/api/v1/staff/${mockStaffId}/references`)
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send(refData);

    expect(res.status).toBe(201);
    expect(res.body.data.companyName).toBe('Acme Services Ltd');
  });

  // 15. StaffContract create/update
  it('15. should upsert StaffContract entity', async () => {
    jest.spyOn(staffRepository, 'findById').mockResolvedValue(mockStaffRecord as any);
    jest.spyOn(staffRepository, 'upsertStaffContract').mockResolvedValue({
      id: 'sc-1',
      staffId: mockStaffId,
      contractVersion: 'v1.0-2026',
      signedDigitally: true,
      signedAt: new Date(),
      signatureSvgOrUrl: 'svg-data',
      pdfCopyUrl: 'https://example.com/contract.pdf',
    } as any);

    const contractData = {
      contractVersion: 'v1.0-2026',
      signedDigitally: true,
    };

    const res = await request(app)
      .put(`/api/v1/staff/${mockStaffId}/contract`)
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send(contractData);

    expect(res.status).toBe(200);
    expect(res.body.data.contractVersion).toBe('v1.0-2026');
  });

  // 16. Unauthorized request
  it('16. should return 401 Unauthorized when missing access token', async () => {
    const res = await request(app).get('/api/v1/staff');
    expect(res.status).toBe(401);
  });

  // 17. Admin without required permission
  it('17. should return 403 Forbidden when admin lacks staff.create permission', async () => {
    const restrictedAdminUser = {
      ...mockAdminUser,
      roles: [
        {
          role: {
            id: 'r-readonly',
            name: 'ReadOnlyAdmin',
            permissions: [{ permission: { id: 'p1', code: 'staff.read', module: 'staff' } }],
          },
        },
      ],
    };

    jest.spyOn(authRepository, 'findAdminById').mockResolvedValue(restrictedAdminUser as any);

    const res = await request(app)
      .post('/api/v1/staff')
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({
        workerCode: 'STF-777',
        email: 'test@usafi.com',
        phone: '+254700777777',
        password: 'Password123!',
      });

    expect(res.status).toBe(403);
  });

  // 18. Staff access to another staff member's protected data
  it('18. should deny staff user access to another staff member profile', async () => {
    const res = await request(app)
      .get(`/api/v1/staff/${otherStaffId}`)
      .set('Authorization', `Bearer ${mockStaffToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('cannot access another staff member\'s profile');
  });

  // 19. Staff self-service where explicitly supported
  it('19. should allow authenticated staff user to access their own profile via /staff/me', async () => {
    jest.spyOn(staffRepository, 'findById').mockResolvedValue(mockStaffRecord as any);

    const res = await request(app)
      .get('/api/v1/staff/me')
      .set('Authorization', `Bearer ${mockStaffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(mockStaffId);
  });

  // 20. Transaction rollback when multi-record operation fails
  it('20. should abort creation and throw error if transaction fails', async () => {
    jest.spyOn(staffRepository, 'findByWorkerCode').mockResolvedValue(null);
    jest.spyOn(staffRepository, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(staffRepository, 'findByPhone').mockResolvedValue(null);
    jest.spyOn(staffRepository, 'create').mockRejectedValue(new Error('Transaction Failed Abort'));

    const res = await request(app)
      .post('/api/v1/staff')
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({
        workerCode: 'STF-FAIL',
        email: 'fail@usafi.com',
        phone: '+254700000001',
        password: 'Password123!',
      });

    expect(res.status).toBe(500);
  });
});
