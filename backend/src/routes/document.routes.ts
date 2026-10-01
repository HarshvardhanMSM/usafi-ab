import { Router } from 'express';
import { documentController } from '../controllers/document.controller';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createDocumentTypeSchema,
  updateDocumentTypeSchema,
  createStaffDocumentSchema,
  updateStaffDocumentSchema,
  staffDocumentQuerySchema,
  createDocumentReviewSchema,
  createPolicyDocumentSchema,
  updatePolicyDocumentSchema,
  policyDocumentQuerySchema,
} from '../validators/document.validator';

const router = Router();

// ==========================================
// 1. DOCUMENT TYPES CATALOG ROUTES
// ==========================================

/**
 * @openapi
 * /api/v1/documents/types:
 *   get:
 *     summary: List All Catalog Document Types
 *     tags:
 *       - Documents & Compliance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Document types retrieved successfully
 *   post:
 *     summary: Create New Document Type
 *     tags:
 *       - Documents & Compliance
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *             properties:
 *               code:
 *                 type: string
 *                 example: PASSPORT
 *               name:
 *                 type: string
 *                 example: Passport / Identity Card
 *               isMandatory:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Document type created successfully
 *       409:
 *         description: Conflict - Code already exists
 */
router.get('/types', authenticate, (req, res, next) => {
  documentController.getAllDocumentTypes(req, res, next);
});

router.get('/types/:id', authenticate, (req, res, next) => {
  documentController.getDocumentTypeById(req, res, next);
});

router.post('/types', authenticate, requirePermission('staff.create'), validate({ body: createDocumentTypeSchema }), (req, res, next) => {
  documentController.createDocumentType(req, res, next);
});

router.patch('/types/:id', authenticate, requirePermission('staff.update'), validate({ body: updateDocumentTypeSchema }), (req, res, next) => {
  documentController.updateDocumentType(req, res, next);
});

router.delete('/types/:id', authenticate, requirePermission('staff.delete'), (req, res, next) => {
  documentController.deleteDocumentType(req, res, next);
});

// ==========================================
// 2. STAFF DOCUMENTS ROUTES
// ==========================================

/**
 * @openapi
 * /api/v1/documents/staff-documents:
 *   get:
 *     summary: List Staff Documents (Paginated & Filterable)
 *     tags:
 *       - Documents & Compliance
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
 *         name: staffId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, EXPIRED]
 *     responses:
 *       200:
 *         description: Staff documents retrieved successfully
 */
router.get('/staff-documents', authenticate, validate({ query: staffDocumentQuerySchema }), (req, res, next) => {
  documentController.getStaffDocuments(req, res, next);
});

router.get('/staff-documents/:id', authenticate, (req, res, next) => {
  documentController.getStaffDocumentById(req, res, next);
});

/**
 * @openapi
 * /api/v1/documents/staff/{staffId}:
 *   post:
 *     summary: Record/Upload Staff Compliance Document
 *     tags:
 *       - Documents & Compliance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff UUID or 'me' for self-service
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentTypeId
 *               - fileUrl
 *               - fileName
 *             properties:
 *               documentTypeId:
 *                 type: string
 *               fileUrl:
 *                 type: string
 *               fileName:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Staff document recorded successfully
 */
router.post('/staff/:staffId', authenticate, validate({ body: createStaffDocumentSchema }), (req, res, next) => {
  documentController.createStaffDocument(req, res, next);
});

router.patch('/staff-documents/:id', authenticate, validate({ body: updateStaffDocumentSchema }), (req, res, next) => {
  documentController.updateStaffDocument(req, res, next);
});

router.delete('/staff-documents/:id', authenticate, (req, res, next) => {
  documentController.deleteStaffDocument(req, res, next);
});

// ==========================================
// 3. DOCUMENT REVIEW WORKFLOW ROUTE
// ==========================================

/**
 * @openapi
 * /api/v1/documents/staff-documents/{id}/review:
 *   post:
 *     summary: Submit Admin Compliance Document Review (Approve/Reject)
 *     tags:
 *       - Documents & Compliance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *               rejectionReason:
 *                 type: string
 *                 example: Document image is blurred or expired
 *     responses:
 *       200:
 *         description: Document review saved and status updated
 *       400:
 *         description: Rejection reason required when rejecting
 *       403:
 *         description: Forbidden - Only administrators can perform reviews
 */
router.post('/staff-documents/:id/review', authenticate, requirePermission('staff.update'), validate({ body: createDocumentReviewSchema }), (req, res, next) => {
  documentController.reviewStaffDocument(req, res, next);
});

// ==========================================
// 4. POLICY DOCUMENTS ROUTES
// ==========================================

/**
 * @openapi
 * /api/v1/documents/policies:
 *   get:
 *     summary: List Published Company Policy Documents
 *     tags:
 *       - Documents & Compliance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Policy documents retrieved successfully
 *   post:
 *     summary: Publish New Policy Document
 *     tags:
 *       - Documents & Compliance
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - fileUrl
 *             properties:
 *               title:
 *                 type: string
 *                 example: Health & Safety Handbook 2026
 *               category:
 *                 type: string
 *                 example: Safety
 *               fileUrl:
 *                 type: string
 *               version:
 *                 type: string
 *                 default: "1.0"
 *               isMandatoryAcknowledgement:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Policy document published successfully
 */
router.get('/policies', authenticate, validate({ query: policyDocumentQuerySchema }), (req, res, next) => {
  documentController.getPolicyDocuments(req, res, next);
});

router.get('/policies/:id', authenticate, (req, res, next) => {
  documentController.getPolicyDocumentById(req, res, next);
});

router.post('/policies', authenticate, requirePermission('staff.create'), validate({ body: createPolicyDocumentSchema }), (req, res, next) => {
  documentController.createPolicyDocument(req, res, next);
});

router.patch('/policies/:id', authenticate, requirePermission('staff.update'), validate({ body: updatePolicyDocumentSchema }), (req, res, next) => {
  documentController.updatePolicyDocument(req, res, next);
});

router.delete('/policies/:id', authenticate, requirePermission('staff.delete'), (req, res, next) => {
  documentController.deletePolicyDocument(req, res, next);
});

export default router;
