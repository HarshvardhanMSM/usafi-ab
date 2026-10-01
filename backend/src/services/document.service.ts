import { ReviewAction } from '@prisma/client';
import { documentRepository } from '../repositories/document.repository';
import { staffRepository } from '../repositories/staff.repository';
import { ApiError } from '../utils/apiError';
import {
  DocumentTypeInput,
  UpdateDocumentTypeInput,
  CreateStaffDocumentInput,
  UpdateStaffDocumentInput,
  StaffDocumentQuery,
  CreatePolicyDocumentInput,
  UpdatePolicyDocumentInput,
  PolicyDocumentQuery,
} from '../types/document.types';

export class DocumentService {
  // ==========================================
  // DOCUMENT TYPE SERVICES
  // ==========================================

  async getAllDocumentTypes() {
    return documentRepository.findAllDocumentTypes();
  }

  async getDocumentTypeById(id: string) {
    const docType = await documentRepository.findDocumentTypeById(id);
    if (!docType) {
      throw ApiError.notFound('Document type not found');
    }
    return docType;
  }

  async createDocumentType(input: DocumentTypeInput) {
    const existingCode = await documentRepository.findDocumentTypeByCode(input.code);
    if (existingCode) {
      throw ApiError.conflict(`Document type code '${input.code}' already exists`);
    }
    return documentRepository.createDocumentType(input);
  }

  async updateDocumentType(id: string, input: UpdateDocumentTypeInput) {
    await this.getDocumentTypeById(id);

    if (input.code) {
      const existingCode = await documentRepository.findDocumentTypeByCode(input.code);
      if (existingCode && existingCode.id !== id) {
        throw ApiError.conflict(`Document type code '${input.code}' already exists`);
      }
    }

    return documentRepository.updateDocumentType(id, input);
  }

  async deleteDocumentType(id: string) {
    await this.getDocumentTypeById(id);
    await documentRepository.deleteDocumentType(id);
  }

  // ==========================================
  // STAFF DOCUMENT SERVICES
  // ==========================================

  async getStaffDocuments(query: StaffDocumentQuery) {
    return documentRepository.findStaffDocuments(query);
  }

  async getStaffDocumentById(id: string) {
    const doc = await documentRepository.findStaffDocumentById(id);
    if (!doc) {
      throw ApiError.notFound('Staff document not found');
    }
    return doc;
  }

  async createStaffDocument(targetStaffId: string, input: CreateStaffDocumentInput) {
    const staff = await staffRepository.findById(targetStaffId);
    if (!staff) {
      throw ApiError.notFound('Target staff member not found');
    }

    const docType = await documentRepository.findDocumentTypeById(input.documentTypeId);
    if (!docType) {
      throw ApiError.notFound('Document type not found');
    }

    return documentRepository.createStaffDocument(targetStaffId, input);
  }

  async updateStaffDocument(id: string, input: UpdateStaffDocumentInput) {
    await this.getStaffDocumentById(id);

    if (input.documentTypeId) {
      const docType = await documentRepository.findDocumentTypeById(input.documentTypeId);
      if (!docType) {
        throw ApiError.notFound('Document type not found');
      }
    }

    return documentRepository.updateStaffDocument(id, input);
  }

  async deleteStaffDocument(id: string) {
    await this.getStaffDocumentById(id);
    await documentRepository.deleteStaffDocument(id);
  }

  // ==========================================
  // DOCUMENT REVIEW WORKFLOW SERVICE
  // ==========================================

  async reviewStaffDocument(
    staffDocumentId: string,
    reviewerId: string,
    action: ReviewAction,
    rejectionReason?: string,
  ) {
    const doc = await this.getStaffDocumentById(staffDocumentId);
    if (!doc) {
      throw ApiError.notFound('Staff document not found');
    }

    if (action === ReviewAction.REJECTED && (!rejectionReason || !rejectionReason.trim())) {
      throw ApiError.badRequest('Rejection reason is required when rejecting a document');
    }

    return documentRepository.createDocumentReview(
      staffDocumentId,
      reviewerId,
      action,
      rejectionReason,
    );
  }

  // ==========================================
  // POLICY DOCUMENT SERVICES
  // ==========================================

  async getPolicyDocuments(query: PolicyDocumentQuery) {
    return documentRepository.findPolicyDocuments(query);
  }

  async getPolicyDocumentById(id: string) {
    const policy = await documentRepository.findPolicyDocumentById(id);
    if (!policy) {
      throw ApiError.notFound('Policy document not found');
    }
    return policy;
  }

  async createPolicyDocument(createdById: string | null, input: CreatePolicyDocumentInput) {
    return documentRepository.createPolicyDocument(createdById, input);
  }

  async updatePolicyDocument(id: string, input: UpdatePolicyDocumentInput) {
    await this.getPolicyDocumentById(id);
    return documentRepository.updatePolicyDocument(id, input);
  }

  async deletePolicyDocument(id: string) {
    await this.getPolicyDocumentById(id);
    await documentRepository.deletePolicyDocument(id);
  }
}

export const documentService = new DocumentService();
