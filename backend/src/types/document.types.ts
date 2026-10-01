import { DocumentStatus, ReviewAction } from '@prisma/client';

export interface DocumentTypeInput {
  code: string;
  name: string;
  isMandatory?: boolean;
}

export interface UpdateDocumentTypeInput {
  code?: string;
  name?: string;
  isMandatory?: boolean;
}

export interface CreateStaffDocumentInput {
  staffId?: string;
  documentTypeId: string;
  fileUrl: string;
  fileName: string;
  expiryDate?: string | Date;
}

export interface UpdateStaffDocumentInput {
  documentTypeId?: string;
  fileUrl?: string;
  fileName?: string;
  status?: DocumentStatus;
  expiryDate?: string | Date;
}

export interface StaffDocumentQuery {
  page?: number;
  limit?: number;
  staffId?: string;
  documentTypeId?: string;
  status?: DocumentStatus;
}

export interface CreateDocumentReviewInput {
  action: ReviewAction;
  rejectionReason?: string;
}

export interface CreatePolicyDocumentInput {
  title: string;
  category: string;
  fileUrl: string;
  version?: string;
  isMandatoryAcknowledgement?: boolean;
}

export interface UpdatePolicyDocumentInput {
  title?: string;
  category?: string;
  fileUrl?: string;
  version?: string;
  isMandatoryAcknowledgement?: boolean;
}

export interface PolicyDocumentQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}
