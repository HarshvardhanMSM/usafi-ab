import { Router } from 'express';
import { getHealth } from '../controllers/health.controller';

const router = Router();

/**
 * @openapi
 * /api/v1/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns operational status and current environment of Usafi API.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API is healthy and running.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Usafi API is running
 *                 data:
 *                   type: object
 *                   properties:
 *                     environment:
 *                       type: string
 *                       example: development
 */
router.get('/health', getHealth);

export default router;
