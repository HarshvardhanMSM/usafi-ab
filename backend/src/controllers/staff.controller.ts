import { Request, Response, NextFunction } from 'express';
import { staffService } from '../services/staff.service';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/apiError';
import { StaffFilterQuery } from '../types/staff.types';

export class StaffController {
  /**
   * Helper to resolve staff ID from param or 'me' keyword for staff self-service
   */
  private resolveStaffId(req: Request): string {
    const paramId = (req.params.id || req.params.staffId) as string;
    if (paramId === 'me' || (req.user?.userType === 'STAFF' && paramId === req.user.userId)) {
      if (!req.user?.userId) {
        throw ApiError.unauthorized('User context is missing');
      }
      return req.user.userId;
    }

    if (!paramId) {
      throw ApiError.badRequest('Staff ID is required');
    }

    return paramId;
  }

  // ==========================================
  // STAFF DIRECTORY CONTROLLERS
  // ==========================================

  async getStaffList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await staffService.getStaffList(req.query as unknown as StaffFilterQuery);
      sendSuccess(res, 'Staff list retrieved successfully', result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getStaffById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const staffId = this.resolveStaffId(req);
      const staff = await staffService.getStaffById(staffId);
      sendSuccess(res, 'Staff details retrieved successfully', staff, 200);
    } catch (error) {
      next(error);
    }
  }

  async createStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const staff = await staffService.createStaff(req.body);
      sendSuccess(res, 'Staff member created successfully', staff, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const staffId = this.resolveStaffId(req);
      const updated = await staffService.updateStaff(staffId, req.body);
      sendSuccess(res, 'Staff member updated successfully', updated, 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const staffId = this.resolveStaffId(req);
      await staffService.deleteStaff(staffId);
      sendSuccess(res, 'Staff member deleted successfully', null, 200);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // PROFILE SUB-RESOURCE CONTROLLERS
  // ==========================================

  async upsertPersonalDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const staffId = this.resolveStaffId(req);
      const details = await staffService.upsertPersonalDetails(staffId, req.body);
      sendSuccess(res, 'Personal details saved successfully', details, 200);
    } catch (error) {
      next(error);
    }
  }

  async upsertHealthInformation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const staffId = this.resolveStaffId(req);
      const health = await staffService.upsertHealthInformation(staffId, req.body);
      sendSuccess(res, 'Health information saved successfully', health, 200);
    } catch (error) {
      next(error);
    }
  }

  async upsertBankDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const staffId = this.resolveStaffId(req);
      const bank = await staffService.upsertBankDetails(staffId, req.body);
      sendSuccess(res, 'Bank details saved successfully', bank, 200);
    } catch (error) {
      next(error);
    }
  }

  async upsertNextOfKin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const staffId = this.resolveStaffId(req);
      const kin = await staffService.upsertNextOfKin(staffId, req.body);
      sendSuccess(res, 'Next of kin saved successfully', kin, 200);
    } catch (error) {
      next(error);
    }
  }

  async upsertStaffContract(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const staffId = this.resolveStaffId(req);
      const contract = await staffService.upsertStaffContract(staffId, req.body);
      sendSuccess(res, 'Staff contract saved successfully', contract, 200);
    } catch (error) {
      next(error);
    }
  }

  async createQualification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const staffId = this.resolveStaffId(req);
      const qualification = await staffService.createQualification(staffId, req.body);
      sendSuccess(res, 'Qualification record created successfully', qualification, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateQualification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const staffId = this.resolveStaffId(req);
      const qualificationId = req.params.qualificationId as string;
      const updated = await staffService.updateQualification(staffId, qualificationId, req.body);
      sendSuccess(res, 'Qualification record updated successfully', updated, 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteQualification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const staffId = this.resolveStaffId(req);
      const qualificationId = req.params.qualificationId as string;
      await staffService.deleteQualification(staffId, qualificationId);
      sendSuccess(res, 'Qualification record deleted successfully', null, 200);
    } catch (error) {
      next(error);
    }
  }

  async createEmploymentReference(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const staffId = this.resolveStaffId(req);
      const reference = await staffService.createEmploymentReference(staffId, req.body);
      sendSuccess(res, 'Employment reference created successfully', reference, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateEmploymentReference(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const staffId = this.resolveStaffId(req);
      const referenceId = req.params.referenceId as string;
      const updated = await staffService.updateEmploymentReference(staffId, referenceId, req.body);
      sendSuccess(res, 'Employment reference updated successfully', updated, 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteEmploymentReference(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const staffId = this.resolveStaffId(req);
      const referenceId = req.params.referenceId as string;
      await staffService.deleteEmploymentReference(staffId, referenceId);
      sendSuccess(res, 'Employment reference deleted successfully', null, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const staffController = new StaffController();
