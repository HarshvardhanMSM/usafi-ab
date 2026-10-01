import { z } from 'zod';
import {
  StaffStatus,
  Gender,
  FitnessStatus,
  BankVerificationStatus,
  ReferenceVerificationStatus,
} from '@prisma/client';

export const staffStatusEnum = z.nativeEnum(StaffStatus);
export const genderEnum = z.nativeEnum(Gender);
export const fitnessStatusEnum = z.nativeEnum(FitnessStatus);
export const bankVerificationStatusEnum = z.nativeEnum(BankVerificationStatus);
export const referenceVerificationStatusEnum = z.nativeEnum(ReferenceVerificationStatus);

export const personalDetailsSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  dateOfBirth: z.coerce.date({ message: 'Valid date of birth is required' }),
  gender: genderEnum,
  nationality: z.string().trim().max(100).optional(),
  niNumber: z.string().trim().max(20).optional(),
  utrNumber: z.string().trim().max(20).optional(),
  addressLine1: z.string().trim().min(1, 'Address line 1 is required'),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(1, 'City is required').max(100),
  postcode: z.string().trim().min(1, 'Postcode is required').max(20),
  country: z.string().trim().min(1, 'Country is required').max(100),
});

export const createStaffSchema = z.object({
  workerCode: z.string().trim().min(1, 'Worker code is required').max(20),
  email: z.string().trim().toLowerCase().email('Invalid email format'),
  phone: z.string().trim().min(5, 'Valid phone number is required').max(20),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  status: staffStatusEnum.optional().default(StaffStatus.PENDING_ONBOARDING),
  avatarUrl: z.string().url('Invalid avatar URL format').optional(),
  primaryRoleId: z.string().uuid('Invalid role ID format').optional(),
  pushToken: z.string().trim().optional(),
  personalDetails: personalDetailsSchema.optional(),
});

export const updateStaffSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email format').optional(),
  phone: z.string().trim().min(5, 'Valid phone number is required').max(20).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  status: staffStatusEnum.optional(),
  avatarUrl: z.string().url('Invalid avatar URL format').optional(),
  primaryRoleId: z.string().uuid('Invalid role ID format').optional(),
  pushToken: z.string().trim().optional(),
});

export const staffQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().trim().optional(),
  status: staffStatusEnum.optional(),
  primaryRoleId: z.string().uuid().optional(),
});

export const healthInformationSchema = z.object({
  fitnessStatus: fitnessStatusEnum,
  bloodGroup: z.string().trim().max(10).optional(),
  emergencyContactName: z.string().trim().max(150).optional(),
  emergencyContactPhone: z.string().trim().max(20).optional(),
  allergiesMedicalNotes: z.string().trim().optional(),
  disabilityAccommodations: z.string().trim().optional(),
});

export const bankDetailsSchema = z.object({
  accountHolderName: z.string().trim().min(1, 'Account holder name is required').max(150),
  bankName: z.string().trim().min(1, 'Bank name is required').max(100),
  sortCodeEncrypted: z.string().trim().min(1, 'Sort code is required'),
  accountNumberEncrypted: z.string().trim().min(1, 'Account number is required'),
  verificationStatus: bankVerificationStatusEnum.optional().default(BankVerificationStatus.PENDING),
});

export const nextOfKinSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(150),
  relationship: z.string().trim().min(1, 'Relationship is required').max(50),
  phone: z.string().trim().min(5, 'Phone is required').max(20),
  email: z.string().trim().toLowerCase().email('Invalid email format').optional(),
  address: z.string().trim().optional(),
});

export const qualificationSchema = z.object({
  title: z.string().trim().min(1, 'Qualification title is required').max(150),
  highestEducationLevel: z.string().trim().max(100).optional(),
  yearsOfExperience: z.coerce.number().int().min(0).optional(),
  specializedCertifications: z.string().trim().optional(),
  issueDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  certificateDocumentUrl: z.string().url('Invalid document URL format').optional(),
});

export const updateQualificationSchema = qualificationSchema.partial();

export const employmentReferenceSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required').max(150),
  supervisorName: z.string().trim().min(1, 'Supervisor name is required').max(150),
  supervisorPhone: z.string().trim().min(5, 'Supervisor phone is required').max(20),
  supervisorEmail: z.string().trim().toLowerCase().email('Invalid email format').optional(),
  jobTitle: z.string().trim().max(100).optional(),
  verificationStatus: referenceVerificationStatusEnum.optional().default(ReferenceVerificationStatus.PENDING),
});

export const updateEmploymentReferenceSchema = employmentReferenceSchema.partial();

export const staffContractSchema = z.object({
  contractVersion: z.string().trim().min(1, 'Contract version is required').max(50),
  signedDigitally: z.boolean().optional().default(false),
  signedAt: z.coerce.date().optional(),
  signatureSvgOrUrl: z.string().trim().optional(),
  pdfCopyUrl: z.string().url('Invalid PDF URL format').optional(),
});

export const staffIdParamSchema = z.object({
  id: z.string().uuid('Invalid staff UUID format'),
});
