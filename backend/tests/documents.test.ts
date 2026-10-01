/* eslint-disable @typescript-eslint/no-explicit-any */
import request from 'supertest';
import { app } from '../src/app';
import { documentRepository } from '../src/repositories/document.repository';
import { staffRepository } from '../src/repositories/staff.repository';
import { authRepository } from '../src/repositories/auth.repository';
import { generateAccessToken } from '../src/utils/jwt';
import { UserType, DocumentStatus, ReviewAction } from '@prisma/client';

describe('Phase 3 Documents & Compliance APIs Test Suite', () => {
  const mockAdminId = '11111111-1111-4111-8111-111111111111';
  const mockStaffId = '22222222-2222-4222-8222-222222222222';
  const otherStaffId = '33333333-3333-4333-8333-333333333333';
  const mockSessionId = '44444444-4444-4444-8444-444444444444';
  const mockDocTypeId = '55555555-5555-4555-8555-555555555555';
  const mockStaffDocId = '66666666-6666-4666-8666-666666666666';

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
    firstName: 'Admin',
    lastName: 'User',
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

  const mockDocType = {
    id: mockDocTypeId,
    code: 'PASSPORT',
    name: 'Passport / ID Document',
    isMandatory: true,
  };

  const mockStaffDoc = {
    id: mockStaffDocId,
    staffId: mockStaffId,
    documentTypeId: mockDocTypeId,
    fileUrl: 'https://example.com/passport.pdf',
    fileName: 'passport.pdf',
    status: DocumentStatus.PENDING,
    expiryDate: new Date('2030-01-01'),
    uploadedAt: new Date(),
    documentType: mockDocType,
    staff: {
      id: mockStaffId,
      workerCode: 'STF-1001',
      email: 'staff@usafi.com',
      phone: '+254700000000',
    },
    reviews: [],
  };

  const mockPolicyDoc = {
    id: 'pol-1',
    title: 'Health & Safety Handbook 2026',
    category: 'Safety',
    fileUrl: 'https://example.com/handbook.pdf',
    version: '1.0',
    isMandatoryAcknowledgement: true,
    publishedAt: new Date(),
    createdById: mockAdminId,
    createdBy: {
      id: mockAdminId,
      email: 'admin@usafi.com',
      firstName: 'Admin',
      lastName: 'User',
    },
  };

  beforeEach(() => {
    jest.restoreAllMocks();

    jest.spyOn(authRepository, 'findSessionById').mockResolvedValue({
      id: mockSessionId,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 86400000),
    } as any);

    jest.spyOn(authRepository, 'findAdminById').mockResolvedValue(mockAdminUser as any);
  });

  // 1. DocumentType listing
  it('1. should list all catalog document types', async () => {
    jest.spyOn(documentRepository, 'findAllDocumentTypes').mockResolvedValue([mockDocType as any]);

    const res = await request(app)
      .get('/api/v1/documents/types')
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].code).toBe('PASSPORT');
  });

  // 2. DocumentType creation
  it('2. should create a new catalog document type', async () => {
    jest.spyOn(documentRepository, 'findDocumentTypeByCode').mockResolvedValue(null);
    jest.spyOn(documentRepository, 'createDocumentType').mockResolvedValue({
      id: 'dt-2',
      code: 'DBS_CHECK',
      name: 'DBS Criminal Record Check',
      isMandatory: true,
    } as any);

    const res = await request(app)
      .post('/api/v1/documents/types')
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({
        code: 'DBS_CHECK',
        name: 'DBS Criminal Record Check',
        isMandatory: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.code).toBe('DBS_CHECK');
  });

  // 3. DocumentType update
  it('3. should update an existing document type', async () => {
    jest.spyOn(documentRepository, 'findDocumentTypeById').mockResolvedValue(mockDocType as any);
    jest.spyOn(documentRepository, 'updateDocumentType').mockResolvedValue({
      ...mockDocType,
      name: 'Passport / National Identity Card',
    } as any);

    const res = await request(app)
      .patch('/api/v1/documents/types/dt-1')
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({ name: 'Passport / National Identity Card' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Passport / National Identity Card');
  });

  // 4. DocumentType validation
  it('4. should reject document type creation with invalid code format', async () => {
    const res = await request(app)
      .post('/api/v1/documents/types')
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({
        code: 'A', // too short (min 2)
        name: 'Invalid Type',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // 5. Staff document creation/recording
  it('5. should record a staff compliance document', async () => {
    jest.spyOn(staffRepository, 'findById').mockResolvedValue({ id: mockStaffId } as any);
    jest.spyOn(documentRepository, 'findDocumentTypeById').mockResolvedValue(mockDocType as any);
    jest.spyOn(documentRepository, 'createStaffDocument').mockResolvedValue(mockStaffDoc as any);

    const res = await request(app)
      .post(`/api/v1/documents/staff/${mockStaffId}`)
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({
        documentTypeId: mockDocTypeId,
        fileUrl: 'https://example.com/passport.pdf',
        fileName: 'passport.pdf',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.fileName).toBe('passport.pdf');
  });

  // 6. Staff document retrieval
  it('6. should retrieve a staff document by ID', async () => {
    jest.spyOn(documentRepository, 'findStaffDocumentById').mockResolvedValue(mockStaffDoc as any);

    const res = await request(app)
      .get(`/api/v1/documents/staff-documents/${mockStaffDocId}`)
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(mockStaffDocId);
  });

  // 7. Staff document update
  it('7. should update staff document information', async () => {
    jest.spyOn(documentRepository, 'findStaffDocumentById').mockResolvedValue(mockStaffDoc as any);
    jest.spyOn(documentRepository, 'updateStaffDocument').mockResolvedValue({
      ...mockStaffDoc,
      fileName: 'updated_passport.pdf',
    } as any);

    const res = await request(app)
      .patch('/api/v1/documents/staff-documents/sd-1')
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({ fileName: 'updated_passport.pdf' });

    expect(res.status).toBe(200);
    expect(res.body.data.fileName).toBe('updated_passport.pdf');
  });

  // 8. Staff document deletion
  it('8. should delete a staff document', async () => {
    jest.spyOn(documentRepository, 'findStaffDocumentById').mockResolvedValue(mockStaffDoc as any);
    const deleteSpy = jest.spyOn(documentRepository, 'deleteStaffDocument').mockResolvedValue({} as any);

    const res = await request(app)
      .delete('/api/v1/documents/staff-documents/sd-1')
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.status).toBe(200);
    expect(deleteSpy).toHaveBeenCalledWith('sd-1');
  });

  // 9. Staff document relationship with Staff
  it('9. should verify staff document relation includes staff identity', async () => {
    jest.spyOn(documentRepository, 'findStaffDocumentById').mockResolvedValue(mockStaffDoc as any);

    const res = await request(app)
      .get('/api/v1/documents/staff-documents/sd-1')
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.staff.id).toBe(mockStaffId);
    expect(res.body.data.staff.workerCode).toBe('STF-1001');
  });

  // 10. Staff document relationship with DocumentType
  it('10. should verify staff document relation includes documentType details', async () => {
    jest.spyOn(documentRepository, 'findStaffDocumentById').mockResolvedValue(mockStaffDoc as any);

    const res = await request(app)
      .get('/api/v1/documents/staff-documents/sd-1')
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.documentType.code).toBe('PASSPORT');
  });

  // 11. Document review workflow
  it('11. should submit an admin document review', async () => {
    jest.spyOn(documentRepository, 'findStaffDocumentById').mockResolvedValue(mockStaffDoc as any);
    jest.spyOn(documentRepository, 'createDocumentReview').mockResolvedValue({
      id: 'rev-1',
      staffDocumentId: 'sd-1',
      reviewerId: mockAdminId,
      action: ReviewAction.APPROVED,
      rejectionReason: null,
      reviewedAt: new Date(),
    } as any);

    const res = await request(app)
      .post('/api/v1/documents/staff-documents/sd-1/review')
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({ action: ReviewAction.APPROVED });

    expect(res.status).toBe(200);
    expect(res.body.data.action).toBe('APPROVED');
  });

  // 12. Document approval
  it('12. should approve staff document and update status to APPROVED', async () => {
    jest.spyOn(documentRepository, 'findStaffDocumentById').mockResolvedValue(mockStaffDoc as any);
    jest.spyOn(documentRepository, 'createDocumentReview').mockResolvedValue({
      id: 'rev-1',
      action: ReviewAction.APPROVED,
      staffDocument: { ...mockStaffDoc, status: DocumentStatus.APPROVED },
    } as any);

    const res = await request(app)
      .post('/api/v1/documents/staff-documents/sd-1/review')
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({ action: ReviewAction.APPROVED });

    expect(res.status).toBe(200);
    expect(res.body.data.staffDocument.status).toBe('APPROVED');
  });

  // 13. Document rejection
  it('13. should reject staff document with rejectionReason and update status to REJECTED', async () => {
    jest.spyOn(documentRepository, 'findStaffDocumentById').mockResolvedValue(mockStaffDoc as any);
    jest.spyOn(documentRepository, 'createDocumentReview').mockResolvedValue({
      id: 'rev-2',
      action: ReviewAction.REJECTED,
      rejectionReason: 'Blurry document image',
      staffDocument: { ...mockStaffDoc, status: DocumentStatus.REJECTED },
    } as any);

    const res = await request(app)
      .post('/api/v1/documents/staff-documents/sd-1/review')
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({ action: ReviewAction.REJECTED, rejectionReason: 'Blurry document image' });

    expect(res.status).toBe(200);
    expect(res.body.data.action).toBe('REJECTED');
  });

  // 14. Unauthorized document review
  it('14. should deny document review by staff user (HTTP 403)', async () => {
    const res = await request(app)
      .post('/api/v1/documents/staff-documents/sd-1/review')
      .set('Authorization', `Bearer ${mockStaffToken}`)
      .send({ action: ReviewAction.APPROVED });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Forbidden');
  });

  // 15. Staff access to own documents
  it('15. should allow staff member to upload and access their own documents', async () => {
    jest.spyOn(staffRepository, 'findById').mockResolvedValue({ id: mockStaffId } as any);
    jest.spyOn(documentRepository, 'findDocumentTypeById').mockResolvedValue(mockDocType as any);
    jest.spyOn(documentRepository, 'createStaffDocument').mockResolvedValue(mockStaffDoc as any);

    const res = await request(app)
      .post('/api/v1/documents/staff/me')
      .set('Authorization', `Bearer ${mockStaffToken}`)
      .send({
        documentTypeId: mockDocTypeId,
        fileUrl: 'https://example.com/self_passport.pdf',
        fileName: 'self_passport.pdf',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.fileName).toBe('passport.pdf');
  });

  // 16. Staff attempting to access another staff member's documents
  it('16. should deny staff user from accessing another staff member document (HTTP 403)', async () => {
    const otherDoc = { ...mockStaffDoc, staffId: otherStaffId };
    jest.spyOn(documentRepository, 'findStaffDocumentById').mockResolvedValue(otherDoc as any);

    const res = await request(app)
      .get('/api/v1/documents/staff-documents/sd-other')
      .set('Authorization', `Bearer ${mockStaffToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Cannot access another staff member\'s document');
  });

  // 17. Policy document listing
  it('17. should list company policy documents', async () => {
    jest.spyOn(documentRepository, 'findPolicyDocuments').mockResolvedValue({
      items: [mockPolicyDoc as any],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });

    const res = await request(app)
      .get('/api/v1/documents/policies')
      .set('Authorization', `Bearer ${mockStaffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].title).toBe('Health & Safety Handbook 2026');
  });

  // 18. Policy document retrieval
  it('18. should retrieve policy document details by ID', async () => {
    jest.spyOn(documentRepository, 'findPolicyDocumentById').mockResolvedValue(mockPolicyDoc as any);

    const res = await request(app)
      .get('/api/v1/documents/policies/pol-1')
      .set('Authorization', `Bearer ${mockStaffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('pol-1');
  });

  // 19. Policy document creation/update
  it('19. should publish a new policy document', async () => {
    jest.spyOn(documentRepository, 'createPolicyDocument').mockResolvedValue(mockPolicyDoc as any);

    const res = await request(app)
      .post('/api/v1/documents/policies')
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({
        title: 'Health & Safety Handbook 2026',
        category: 'Safety',
        fileUrl: 'https://example.com/handbook.pdf',
        isMandatoryAcknowledgement: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Health & Safety Handbook 2026');
  });

  // 20. Validation/error handling
  it('20. should return 400 validation error when rejecting document without rejectionReason', async () => {
    jest.spyOn(documentRepository, 'findStaffDocumentById').mockResolvedValue(mockStaffDoc as any);

    const res = await request(app)
      .post('/api/v1/documents/staff-documents/sd-1/review')
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({ action: ReviewAction.REJECTED }); // Missing rejectionReason

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
