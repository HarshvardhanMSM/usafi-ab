import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import {
  StaffFilterQuery,
  CreateStaffInput,
  UpdateStaffInput,
  PersonalDetailsInput,
  HealthInformationInput,
  BankDetailsInput,
  NextOfKinInput,
  QualificationInput,
  EmploymentReferenceInput,
  StaffContractInput,
} from '../types/staff.types';

export class StaffRepository {
  /**
   * Find paginated list of staff members with optional search and filters
   */
  async findMany(query: StaffFilterQuery) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.StaffWhereInput = {};

    if (query.status) {
      whereClause.status = query.status;
    }

    if (query.primaryRoleId) {
      whereClause.primaryRoleId = query.primaryRoleId;
    }

    if (query.search) {
      const search = query.search;
      whereClause.OR = [
        { workerCode: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        {
          personalDetails: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.staff.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          primaryRole: true,
          personalDetails: true,
        },
      }),
      prisma.staff.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Find staff member by ID with all profile relations
   */
  async findById(id: string) {
    return prisma.staff.findUnique({
      where: { id },
      include: {
        primaryRole: true,
        personalDetails: true,
        healthInformation: true,
        bankDetails: true,
        nextOfKin: true,
        qualifications: true,
        employmentReferences: true,
        staffContract: true,
      },
    });
  }

  /**
   * Find staff by workerCode
   */
  async findByWorkerCode(workerCode: string) {
    return prisma.staff.findUnique({
      where: { workerCode },
    });
  }

  /**
   * Find staff by email
   */
  async findByEmail(email: string) {
    return prisma.staff.findUnique({
      where: { email },
    });
  }

  /**
   * Find staff by phone
   */
  async findByPhone(phone: string) {
    return prisma.staff.findUnique({
      where: { phone },
    });
  }

  /**
   * Create staff member atomically with optional personalDetails in a transaction
   */
  async create(input: CreateStaffInput, passwordHash: string) {
    return prisma.$transaction(async (tx) => {
      const staff = await tx.staff.create({
        data: {
          workerCode: input.workerCode,
          email: input.email,
          phone: input.phone,
          passwordHash,
          status: input.status,
          avatarUrl: input.avatarUrl ?? null,
          primaryRoleId: input.primaryRoleId ?? null,
          pushToken: input.pushToken ?? null,
        },
      });

      if (input.personalDetails) {
        await tx.personalDetails.create({
          data: {
            staffId: staff.id,
            firstName: input.personalDetails.firstName,
            lastName: input.personalDetails.lastName,
            dateOfBirth: new Date(input.personalDetails.dateOfBirth),
            gender: input.personalDetails.gender,
            nationality: input.personalDetails.nationality ?? null,
            niNumber: input.personalDetails.niNumber ?? null,
            utrNumber: input.personalDetails.utrNumber ?? null,
            addressLine1: input.personalDetails.addressLine1,
            addressLine2: input.personalDetails.addressLine2 ?? null,
            city: input.personalDetails.city,
            postcode: input.personalDetails.postcode,
            country: input.personalDetails.country,
          },
        });
      }

      return tx.staff.findUnique({
        where: { id: staff.id },
        include: {
          primaryRole: true,
          personalDetails: true,
        },
      });
    });
  }

  /**
   * Update staff member record
   */
  async update(id: string, input: UpdateStaffInput, passwordHash?: string) {
    const data: Prisma.StaffUpdateInput = {};

    if (input.email !== undefined) data.email = input.email;
    if (input.phone !== undefined) data.phone = input.phone;
    if (input.status !== undefined) data.status = input.status;
    if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl;
    if (input.pushToken !== undefined) data.pushToken = input.pushToken;
    if (passwordHash !== undefined) data.passwordHash = passwordHash;
    if (input.primaryRoleId !== undefined) {
      data.primaryRole = input.primaryRoleId ? { connect: { id: input.primaryRoleId } } : { disconnect: true };
    }

    return prisma.staff.update({
      where: { id },
      data,
      include: {
        primaryRole: true,
        personalDetails: true,
      },
    });
  }

  /**
   * Delete staff member record
   */
  async delete(id: string) {
    return prisma.staff.delete({
      where: { id },
    });
  }

  // ==========================================
  // PROFILE SUB-RESOURCE DATA OPERATIONS
  // ==========================================

  /**
   * Upsert PersonalDetails (1-to-1)
   */
  async upsertPersonalDetails(staffId: string, input: PersonalDetailsInput) {
    const dateOfBirth = new Date(input.dateOfBirth);
    return prisma.personalDetails.upsert({
      where: { staffId },
      create: {
        staffId,
        firstName: input.firstName,
        lastName: input.lastName,
        dateOfBirth,
        gender: input.gender,
        nationality: input.nationality ?? null,
        niNumber: input.niNumber ?? null,
        utrNumber: input.utrNumber ?? null,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 ?? null,
        city: input.city,
        postcode: input.postcode,
        country: input.country,
      },
      update: {
        firstName: input.firstName,
        lastName: input.lastName,
        dateOfBirth,
        gender: input.gender,
        nationality: input.nationality ?? null,
        niNumber: input.niNumber ?? null,
        utrNumber: input.utrNumber ?? null,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 ?? null,
        city: input.city,
        postcode: input.postcode,
        country: input.country,
      },
    });
  }

  /**
   * Upsert HealthInformation (1-to-1)
   */
  async upsertHealthInformation(staffId: string, input: HealthInformationInput) {
    return prisma.healthInformation.upsert({
      where: { staffId },
      create: {
        staffId,
        fitnessStatus: input.fitnessStatus,
        bloodGroup: input.bloodGroup ?? null,
        emergencyContactName: input.emergencyContactName ?? null,
        emergencyContactPhone: input.emergencyContactPhone ?? null,
        allergiesMedicalNotes: input.allergiesMedicalNotes ?? null,
        disabilityAccommodations: input.disabilityAccommodations ?? null,
      },
      update: {
        fitnessStatus: input.fitnessStatus,
        bloodGroup: input.bloodGroup ?? null,
        emergencyContactName: input.emergencyContactName ?? null,
        emergencyContactPhone: input.emergencyContactPhone ?? null,
        allergiesMedicalNotes: input.allergiesMedicalNotes ?? null,
        disabilityAccommodations: input.disabilityAccommodations ?? null,
      },
    });
  }

  /**
   * Upsert BankDetails (1-to-1)
   */
  async upsertBankDetails(staffId: string, input: BankDetailsInput) {
    return prisma.bankDetails.upsert({
      where: { staffId },
      create: {
        staffId,
        accountHolderName: input.accountHolderName,
        bankName: input.bankName,
        sortCodeEncrypted: input.sortCodeEncrypted,
        accountNumberEncrypted: input.accountNumberEncrypted,
        verificationStatus: input.verificationStatus,
      },
      update: {
        accountHolderName: input.accountHolderName,
        bankName: input.bankName,
        sortCodeEncrypted: input.sortCodeEncrypted,
        accountNumberEncrypted: input.accountNumberEncrypted,
        ...(input.verificationStatus ? { verificationStatus: input.verificationStatus } : {}),
      },
    });
  }

  /**
   * Upsert NextOfKin (1-to-1)
   */
  async upsertNextOfKin(staffId: string, input: NextOfKinInput) {
    return prisma.nextOfKin.upsert({
      where: { staffId },
      create: {
        staffId,
        fullName: input.fullName,
        relationship: input.relationship,
        phone: input.phone,
        email: input.email ?? null,
        address: input.address ?? null,
      },
      update: {
        fullName: input.fullName,
        relationship: input.relationship,
        phone: input.phone,
        email: input.email ?? null,
        address: input.address ?? null,
      },
    });
  }

  /**
   * Upsert StaffContract (1-to-1)
   */
  async upsertStaffContract(staffId: string, input: StaffContractInput) {
    const signedAt = input.signedAt ? new Date(input.signedAt) : undefined;
    return prisma.staffContract.upsert({
      where: { staffId },
      create: {
        staffId,
        contractVersion: input.contractVersion,
        signedDigitally: input.signedDigitally ?? false,
        signedAt: signedAt ?? null,
        signatureSvgOrUrl: input.signatureSvgOrUrl ?? null,
        pdfCopyUrl: input.pdfCopyUrl ?? null,
      },
      update: {
        contractVersion: input.contractVersion,
        ...(input.signedDigitally !== undefined ? { signedDigitally: input.signedDigitally } : {}),
        ...(signedAt !== undefined ? { signedAt } : {}),
        ...(input.signatureSvgOrUrl !== undefined ? { signatureSvgOrUrl: input.signatureSvgOrUrl } : {}),
        ...(input.pdfCopyUrl !== undefined ? { pdfCopyUrl: input.pdfCopyUrl } : {}),
      },
    });
  }

  /**
   * Qualifications CRUD (1-to-Many)
   */
  async createQualification(staffId: string, input: QualificationInput) {
    return prisma.qualification.create({
      data: {
        staffId,
        title: input.title,
        highestEducationLevel: input.highestEducationLevel ?? null,
        yearsOfExperience: input.yearsOfExperience ?? null,
        specializedCertifications: input.specializedCertifications ?? null,
        issueDate: input.issueDate ? new Date(input.issueDate) : null,
        expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
        certificateDocumentUrl: input.certificateDocumentUrl ?? null,
      },
    });
  }

  async findQualificationById(id: string) {
    return prisma.qualification.findUnique({
      where: { id },
    });
  }

  async updateQualification(id: string, input: Partial<QualificationInput>) {
    return prisma.qualification.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.highestEducationLevel !== undefined ? { highestEducationLevel: input.highestEducationLevel } : {}),
        ...(input.yearsOfExperience !== undefined ? { yearsOfExperience: input.yearsOfExperience } : {}),
        ...(input.specializedCertifications !== undefined ? { specializedCertifications: input.specializedCertifications } : {}),
        ...(input.issueDate !== undefined ? { issueDate: input.issueDate ? new Date(input.issueDate) : null } : {}),
        ...(input.expiryDate !== undefined ? { expiryDate: input.expiryDate ? new Date(input.expiryDate) : null } : {}),
        ...(input.certificateDocumentUrl !== undefined ? { certificateDocumentUrl: input.certificateDocumentUrl } : {}),
      },
    });
  }

  async deleteQualification(id: string) {
    return prisma.qualification.delete({
      where: { id },
    });
  }

  /**
   * EmploymentReferences CRUD (1-to-Many)
   */
  async createEmploymentReference(staffId: string, input: EmploymentReferenceInput) {
    return prisma.employmentReference.create({
      data: {
        staffId,
        companyName: input.companyName,
        supervisorName: input.supervisorName,
        supervisorPhone: input.supervisorPhone,
        supervisorEmail: input.supervisorEmail ?? null,
        jobTitle: input.jobTitle ?? null,
        verificationStatus: input.verificationStatus,
      },
    });
  }

  async findEmploymentReferenceById(id: string) {
    return prisma.employmentReference.findUnique({
      where: { id },
    });
  }

  async updateEmploymentReference(id: string, input: Partial<EmploymentReferenceInput>) {
    return prisma.employmentReference.update({
      where: { id },
      data: {
        ...(input.companyName !== undefined ? { companyName: input.companyName } : {}),
        ...(input.supervisorName !== undefined ? { supervisorName: input.supervisorName } : {}),
        ...(input.supervisorPhone !== undefined ? { supervisorPhone: input.supervisorPhone } : {}),
        ...(input.supervisorEmail !== undefined ? { supervisorEmail: input.supervisorEmail } : {}),
        ...(input.jobTitle !== undefined ? { jobTitle: input.jobTitle } : {}),
        ...(input.verificationStatus !== undefined ? { verificationStatus: input.verificationStatus } : {}),
      },
    });
  }

  async deleteEmploymentReference(id: string) {
    return prisma.employmentReference.delete({
      where: { id },
    });
  }
}

export const staffRepository = new StaffRepository();
