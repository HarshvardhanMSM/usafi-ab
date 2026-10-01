import { Request, Response, NextFunction } from 'express';
import { documentService } from '../services/document.service';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/apiError';
import { StaffDocumentQuery, PolicyDocumentQuery } from '../types/document.types';

export class DocumentController {
  // ==========================================
  // DOCUMENT TYPE CONTROLLERS
  // ==========================================

  async getAllDocumentTypes(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const docTypes = await documentService.getAllDocumentTypes();
      sendSuccess(res, 'Document types retrieved successfully', docTypes, 200);
    } catch (error) {
      next(error);
    }
  }

  async getDocumentTypeById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const docType = await documentService.getDocumentTypeById(id);
      sendSuccess(res, 'Document type details retrieved successfully', docType, 200);
    } catch (error) {
      next(error);
    }
  }

  async createDocumentType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const docType = await documentService.createDocumentType(req.body);
      sendSuccess(res, 'Document type created successfully', docType, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateDocumentType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const updated = await documentService.updateDocumentType(id, req.body);
      sendSuccess(res, 'Document type updated successfully', updated, 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteDocumentType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await documentService.deleteDocumentType(id);
      sendSuccess(res, 'Document type deleted successfully', null, 200);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // STAFF DOCUMENT CONTROLLERS
  // ==========================================

  async getStaffDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as StaffDocumentQuery;

      // If staff user is querying, enforce self-service filtering to their own staff ID
      if (req.user?.userType === 'STAFF') {
        query.staffId = req.user.userId;
      }

      const result = await documentService.getStaffDocuments(query);
      sendSuccess(res, 'Staff documents retrieved successfully', result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getStaffDocumentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const doc = await documentService.getStaffDocumentById(id);

      // Enforce Staff Self-Service isolation
      if (req.user?.userType === 'STAFF' && doc.staffId !== req.user.userId) {
        throw ApiError.forbidden('Forbidden: Cannot access another staff member\'s document');
      }

      sendSuccess(res, 'Staff document details retrieved successfully', doc, 200);
    } catch (error) {
      next(error);
    }
  }

  async createStaffDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let targetStaffId = (req.params.staffId || req.body.staffId) as string;

      if (targetStaffId === 'me' || (req.user?.userType === 'STAFF' && (!targetStaffId || targetStaffId === req.user.userId))) {
        if (!req.user?.userId) {
          throw ApiError.unauthorized('User context is missing');
        }
        targetStaffId = req.user.userId;
      }

      if (!targetStaffId) {
        throw ApiError.badRequest('Staff ID is required');
      }

      // Enforce Staff Self-Service isolation
      if (req.user?.userType === 'STAFF' && targetStaffId !== req.user.userId) {
        throw ApiError.forbidden('Forbidden: Cannot upload document for another staff member');
      }

      const doc = await documentService.createStaffDocument(targetStaffId, req.body);
      sendSuccess(res, 'Staff document uploaded successfully', doc, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateStaffDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const existing = await documentService.getStaffDocumentById(id);

      // Enforce Staff Self-Service isolation
      if (req.user?.userType === 'STAFF') {
        if (existing.staffId !== req.user.userId) {
          throw ApiError.forbidden('Forbidden: Cannot update another staff member\'s document');
        }
        // Staff members cannot self-approve or change approval status
        if (req.body.status && req.body.status !== existing.status) {
          throw ApiError.forbidden('Forbidden: Staff members cannot modify document review status');
        }
      }

      const updated = await documentService.updateStaffDocument(id, req.body);
      sendSuccess(res, 'Staff document updated successfully', updated, 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteStaffDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const existing = await documentService.getStaffDocumentById(id);

      // Enforce Staff Self-Service isolation
      if (req.user?.userType === 'STAFF' && existing.staffId !== req.user.userId) {
        throw ApiError.forbidden('Forbidden: Cannot delete another staff member\'s document');
      }

      await documentService.deleteStaffDocument(id);
      sendSuccess(res, 'Staff document deleted successfully', null, 200);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // DOCUMENT REVIEW CONTROLLER
  // ==========================================

  async reviewStaffDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.userType !== 'ADMIN') {
        throw ApiError.forbidden('Forbidden: Only authorized administrators can perform document reviews');
      }

      const id = req.params.id as string;
      const reviewerId = req.user.userId;
      const { action, rejectionReason } = req.body;

      const review = await documentService.reviewStaffDocument(id, reviewerId, action, rejectionReason);
      sendSuccess(res, `Document review submitted: ${action}`, review, 200);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // POLICY DOCUMENT CONTROLLERS
  // ==========================================

  async getPolicyDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as PolicyDocumentQuery;
      const result = await documentService.getPolicyDocuments(query);
      sendSuccess(res, 'Policy documents retrieved successfully', result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getPolicyDocumentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const policy = await documentService.getPolicyDocumentById(id);
      sendSuccess(res, 'Policy document details retrieved successfully', policy, 200);
    } catch (error) {
      next(error);
    }
  }

  async createPolicyDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createdById = req.user?.userType === 'ADMIN' ? req.user.userId : null;
      const policy = await documentService.createPolicyDocument(createdById, req.body);
      sendSuccess(res, 'Policy document created successfully', policy, 201);
    } catch (error) {
      next(error);
    }
  }

  async updatePolicyDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const updated = await documentService.updatePolicyDocument(id, req.body);
      sendSuccess(res, 'Policy document updated successfully', updated, 200);
    } catch (error) {
      next(error);
    }
  }

  async deletePolicyDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await documentService.deletePolicyDocument(id);
      sendSuccess(res, 'Policy document deleted successfully', null, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const documentController = new DocumentController();
