import { Router } from 'express';
import { staffController } from '../controllers/staff.controller';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { authorizeStaffAccess } from '../middleware/staffAuth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createStaffSchema,
  updateStaffSchema,
  staffQuerySchema,
  personalDetailsSchema,
  healthInformationSchema,
  bankDetailsSchema,
  nextOfKinSchema,
  qualificationSchema,
  updateQualificationSchema,
  employmentReferenceSchema,
  updateEmploymentReferenceSchema,
  staffContractSchema,
} from '../validators/staff.validator';

const router = Router();

/**
 * @openapi
 * /api/v1/staff:
 *   get:
 *     summary: Get Paginated Staff Directory List
 *     tags:
 *       - Staff Directory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING_ONBOARDING, PENDING_VERIFICATION, ACTIVE, SUSPENDED]
 *     responses:
 *       200:
 *         description: Staff list retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *   post:
 *     summary: Create New Staff Member
 *     tags:
 *       - Staff Directory
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workerCode
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               workerCode:
 *                 type: string
 *                 example: STF-1001
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@usafi.com
 *               phone:
 *                 type: string
 *                 example: "+254700112233"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecretPass123!
 *               status:
 *                 type: string
 *                 enum: [PENDING_ONBOARDING, PENDING_VERIFICATION, ACTIVE, SUSPENDED]
 *     responses:
 *       201:
 *         description: Staff member created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Conflict (duplicate workerCode, email, or phone)
 */
router.get('/', authenticate, requirePermission('staff.read'), validate({ query: staffQuerySchema }), (req, res, next) => {
  staffController.getStaffList(req, res, next);
});

router.post('/', authenticate, requirePermission('staff.create'), validate({ body: createStaffSchema }), (req, res, next) => {
  staffController.createStaff(req, res, next);
});

/**
 * @openapi
 * /api/v1/staff/{id}:
 *   get:
 *     summary: Get Complete Staff Profile Details
 *     tags:
 *       - Staff Profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff UUID or 'me' for staff self-service
 *     responses:
 *       200:
 *         description: Profile details retrieved
 *       404:
 *         description: Staff not found
 *   patch:
 *     summary: Update Staff Member Details
 *     tags:
 *       - Staff Profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff updated
 *   delete:
 *     summary: Delete Staff Member
 *     tags:
 *       - Staff Directory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff deleted
 */
router.get('/:id', authenticate, authorizeStaffAccess('staff.read'), (req, res, next) => {
  staffController.getStaffById(req, res, next);
});

router.patch('/:id', authenticate, authorizeStaffAccess('staff.update'), validate({ body: updateStaffSchema }), (req, res, next) => {
  staffController.updateStaff(req, res, next);
});

router.delete('/:id', authenticate, requirePermission('staff.delete'), (req, res, next) => {
  staffController.deleteStaff(req, res, next);
});

// ==========================================
// PROFILE SUB-RESOURCE ENDPOINTS
// ==========================================

router.put('/:id/personal-details', authenticate, authorizeStaffAccess('staff.update'), validate({ body: personalDetailsSchema }), (req, res, next) => {
  staffController.upsertPersonalDetails(req, res, next);
});

router.put('/:id/health-information', authenticate, authorizeStaffAccess('staff.update'), validate({ body: healthInformationSchema }), (req, res, next) => {
  staffController.upsertHealthInformation(req, res, next);
});

router.put('/:id/bank-details', authenticate, authorizeStaffAccess('staff.update'), validate({ body: bankDetailsSchema }), (req, res, next) => {
  staffController.upsertBankDetails(req, res, next);
});

router.put('/:id/next-of-kin', authenticate, authorizeStaffAccess('staff.update'), validate({ body: nextOfKinSchema }), (req, res, next) => {
  staffController.upsertNextOfKin(req, res, next);
});

router.put('/:id/contract', authenticate, authorizeStaffAccess('staff.update'), validate({ body: staffContractSchema }), (req, res, next) => {
  staffController.upsertStaffContract(req, res, next);
});

// Qualifications (1-to-Many)
router.post('/:id/qualifications', authenticate, authorizeStaffAccess('staff.update'), validate({ body: qualificationSchema }), (req, res, next) => {
  staffController.createQualification(req, res, next);
});

router.patch('/:id/qualifications/:qualificationId', authenticate, authorizeStaffAccess('staff.update'), validate({ body: updateQualificationSchema }), (req, res, next) => {
  staffController.updateQualification(req, res, next);
});

router.delete('/:id/qualifications/:qualificationId', authenticate, authorizeStaffAccess('staff.delete'), (req, res, next) => {
  staffController.deleteQualification(req, res, next);
});

// Employment References (1-to-Many)
router.post('/:id/references', authenticate, authorizeStaffAccess('staff.update'), validate({ body: employmentReferenceSchema }), (req, res, next) => {
  staffController.createEmploymentReference(req, res, next);
});

router.patch('/:id/references/:referenceId', authenticate, authorizeStaffAccess('staff.update'), validate({ body: updateEmploymentReferenceSchema }), (req, res, next) => {
  staffController.updateEmploymentReference(req, res, next);
});

router.delete('/:id/references/:referenceId', authenticate, authorizeStaffAccess('staff.delete'), (req, res, next) => {
  staffController.deleteEmploymentReference(req, res, next);
});

export default router;
