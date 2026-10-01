import {
  StaffStatus,
  Gender,
  FitnessStatus,
  BankVerificationStatus,
  ReferenceVerificationStatus,
} from '@prisma/client';

export interface StaffFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: StaffStatus;
  primaryRoleId?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateStaffInput {
  workerCode: string;
  email: string;
  phone: string;
  password: string;
  status?: StaffStatus;
  avatarUrl?: string;
  primaryRoleId?: string;
  pushToken?: string;
  personalDetails?: PersonalDetailsInput;
}

export interface UpdateStaffInput {
  email?: string;
  phone?: string;
  password?: string;
  status?: StaffStatus;
  avatarUrl?: string;
  primaryRoleId?: string;
  pushToken?: string;
}

export interface PersonalDetailsInput {
  firstName: string;
  lastName: string;
  dateOfBirth: string | Date;
  gender: Gender;
  nationality?: string;
  niNumber?: string;
  utrNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  country: string;
}

export interface HealthInformationInput {
  fitnessStatus: FitnessStatus;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergiesMedicalNotes?: string;
  disabilityAccommodations?: string;
}

export interface BankDetailsInput {
  accountHolderName: string;
  bankName: string;
  sortCodeEncrypted: string;
  accountNumberEncrypted: string;
  verificationStatus?: BankVerificationStatus;
}

export interface NextOfKinInput {
  fullName: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface QualificationInput {
  title: string;
  highestEducationLevel?: string;
  yearsOfExperience?: number;
  specializedCertifications?: string;
  issueDate?: string | Date;
  expiryDate?: string | Date;
  certificateDocumentUrl?: string;
}

export interface EmploymentReferenceInput {
  companyName: string;
  supervisorName: string;
  supervisorPhone: string;
  supervisorEmail?: string;
  jobTitle?: string;
  verificationStatus?: ReferenceVerificationStatus;
}

export interface StaffContractInput {
  contractVersion: string;
  signedDigitally?: boolean;
  signedAt?: string | Date;
  signatureSvgOrUrl?: string;
  pdfCopyUrl?: string;
}
