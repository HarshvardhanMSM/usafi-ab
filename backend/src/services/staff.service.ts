import { staffRepository } from '../repositories/staff.repository';
import { hashPassword } from '../utils/password';
import { ApiError } from '../utils/apiError';
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

export class StaffService {
  /**
   * Helper to strip passwordHash from staff object before sending in response
   */
  public sanitizeStaff<T extends Record<string, unknown>>(staff: T | null): Omit<T, 'passwordHash'> | null {
    if (!staff) return null;
    const sanitized = { ...staff };
    delete sanitized.passwordHash;
    return sanitized as Omit<T, 'passwordHash'>;
  }

  /**
   * Get paginated list of staff members
   */
  async getStaffList(query: StaffFilterQuery) {
    const result = await staffRepository.findMany(query);
    return {
      ...result,
      items: result.items.map((item) => this.sanitizeStaff(item)),
    };
  }

  /**
   * Get staff member by ID
   */
  async getStaffById(id: string) {
    const staff = await staffRepository.findById(id);
    if (!staff) {
      throw ApiError.notFound('Staff member not found');
    }
    return this.sanitizeStaff(staff);
  }

  /**
   * Create staff member with duplicate checking and password hashing in a transaction
   */
  async createStaff(input: CreateStaffInput) {
    const existingWorkerCode = await staffRepository.findByWorkerCode(input.workerCode);
    if (existingWorkerCode) {
      throw ApiError.conflict(`Worker code '${input.workerCode}' is already registered`);
    }

    const existingEmail = await staffRepository.findByEmail(input.email);
    if (existingEmail) {
      throw ApiError.conflict(`Email address '${input.email}' is already registered`);
    }

    const existingPhone = await staffRepository.findByPhone(input.phone);
    if (existingPhone) {
      throw ApiError.conflict(`Phone number '${input.phone}' is already registered`);
    }

    const hashedPassword = await hashPassword(input.password);
    const createdStaff = await staffRepository.create(input, hashedPassword);

    return this.sanitizeStaff(createdStaff);
  }

  /**
   * Update staff member record
   */
  async updateStaff(id: string, input: UpdateStaffInput) {
    const existingStaff = await staffRepository.findById(id);
    if (!existingStaff) {
      throw ApiError.notFound('Staff member not found');
    }

    if (input.email && input.email !== existingStaff.email) {
      const emailConflict = await staffRepository.findByEmail(input.email);
      if (emailConflict) {
        throw ApiError.conflict(`Email address '${input.email}' is already registered`);
      }
    }

    if (input.phone && input.phone !== existingStaff.phone) {
      const phoneConflict = await staffRepository.findByPhone(input.phone);
      if (phoneConflict) {
        throw ApiError.conflict(`Phone number '${input.phone}' is already registered`);
      }
    }

    let hashedPassword: string | undefined;
    if (input.password) {
      hashedPassword = await hashPassword(input.password);
    }

    const updatedStaff = await staffRepository.update(id, input, hashedPassword);
    return this.sanitizeStaff(updatedStaff);
  }

  /**
   * Delete staff member record
   */
  async deleteStaff(id: string) {
    const existingStaff = await staffRepository.findById(id);
    if (!existingStaff) {
      throw ApiError.notFound('Staff member not found');
    }
    await staffRepository.delete(id);
  }

  // ==========================================
  // PROFILE SUB-RESOURCE SERVICES
  // ==========================================

  async upsertPersonalDetails(staffId: string, input: PersonalDetailsInput) {
    await this.getStaffById(staffId);
    return staffRepository.upsertPersonalDetails(staffId, input);
  }

  async upsertHealthInformation(staffId: string, input: HealthInformationInput) {
    await this.getStaffById(staffId);
    return staffRepository.upsertHealthInformation(staffId, input);
  }

  async upsertBankDetails(staffId: string, input: BankDetailsInput) {
    await this.getStaffById(staffId);
    return staffRepository.upsertBankDetails(staffId, input);
  }

  async upsertNextOfKin(staffId: string, input: NextOfKinInput) {
    await this.getStaffById(staffId);
    return staffRepository.upsertNextOfKin(staffId, input);
  }

  async upsertStaffContract(staffId: string, input: StaffContractInput) {
    await this.getStaffById(staffId);
    return staffRepository.upsertStaffContract(staffId, input);
  }

  async createQualification(staffId: string, input: QualificationInput) {
    await this.getStaffById(staffId);
    return staffRepository.createQualification(staffId, input);
  }

  async updateQualification(staffId: string, qualificationId: string, input: Partial<QualificationInput>) {
    await this.getStaffById(staffId);
    const existing = await staffRepository.findQualificationById(qualificationId);
    if (!existing || existing.staffId !== staffId) {
      throw ApiError.notFound('Qualification record not found for this staff member');
    }
    return staffRepository.updateQualification(qualificationId, input);
  }

  async deleteQualification(staffId: string, qualificationId: string) {
    await this.getStaffById(staffId);
    const existing = await staffRepository.findQualificationById(qualificationId);
    if (!existing || existing.staffId !== staffId) {
      throw ApiError.notFound('Qualification record not found for this staff member');
    }
    await staffRepository.deleteQualification(qualificationId);
  }

  async createEmploymentReference(staffId: string, input: EmploymentReferenceInput) {
    await this.getStaffById(staffId);
    return staffRepository.createEmploymentReference(staffId, input);
  }

  async updateEmploymentReference(staffId: string, referenceId: string, input: Partial<EmploymentReferenceInput>) {
    await this.getStaffById(staffId);
    const existing = await staffRepository.findEmploymentReferenceById(referenceId);
    if (!existing || existing.staffId !== staffId) {
      throw ApiError.notFound('Employment reference record not found for this staff member');
    }
    return staffRepository.updateEmploymentReference(referenceId, input);
  }

  async deleteEmploymentReference(staffId: string, referenceId: string) {
    await this.getStaffById(staffId);
    const existing = await staffRepository.findEmploymentReferenceById(referenceId);
    if (!existing || existing.staffId !== staffId) {
      throw ApiError.notFound('Employment reference record not found for this staff member');
    }
    await staffRepository.deleteEmploymentReference(referenceId);
  }
}

export const staffService = new StaffService();
