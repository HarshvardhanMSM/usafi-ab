import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  adminLoginSchema,
  staffLoginSchema,
  refreshTokenSchema,
} from '../validators/auth.validator';

const router = Router();

/**
 * @openapi
 * /api/v1/auth/admin/login:
 *   post:
 *     summary: Authenticate Administrator
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@usafi.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: AdminPass123!
 *     responses:
 *       200:
 *         description: Admin authenticated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
router.post('/admin/login', validate({ body: adminLoginSchema }), (req, res, next) => {
  authController.adminLogin(req, res, next);
});

/**
 * @openapi
 * /api/v1/auth/staff/login:
 *   post:
 *     summary: Authenticate Staff Member
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: staff@usafi.com
 *               workerCode:
 *                 type: string
 *                 example: STF-1001
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StaffPass123!
 *     responses:
 *       200:
 *         description: Staff authenticated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
router.post('/staff/login', validate({ body: staffLoginSchema }), (req, res, next) => {
  authController.staffLogin(req, res, next);
});

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh Access and Refresh Tokens
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *       401:
 *         description: Invalid, expired, or revoked refresh token
 */
router.post('/refresh', validate({ body: refreshTokenSchema }), (req, res, next) => {
  authController.refreshToken(req, res, next);
});

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout and Revoke Current User Session
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', (req, res, next) => {
  // Try authenticating optional bearer token if present, then process logout
  if (req.headers.authorization) {
    authenticate(req, res, () => {
      authController.logout(req, res, next);
    });
  } else {
    authController.logout(req, res, next);
  }
});

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     summary: Get Current Authenticated User Profile
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, (req, res, next) => {
  authController.getMe(req, res, next);
});

export default router;
