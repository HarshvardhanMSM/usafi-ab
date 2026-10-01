import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import staffRoutes from './staff.routes';
import documentRoutes from './document.routes';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils/response';

const apiRouter = Router();

// Mount API v1 sub-routes
apiRouter.use('/', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/staff', staffRoutes);
apiRouter.use('/documents', documentRoutes);

// RBAC Protected Test Routes for Verification & Testing
apiRouter.get('/test/staff-read', authenticate, requirePermission('staff.read'), (req, res) => {
  sendSuccess(res, 'Access granted to staff.read', { user: req.user });
});

apiRouter.get('/test/staff-create', authenticate, requirePermission('staff.create'), (req, res) => {
  sendSuccess(res, 'Access granted to staff.create', { user: req.user });
});

apiRouter.get('/test/staff-delete', authenticate, requirePermission('staff.delete'), (req, res) => {
  sendSuccess(res, 'Access granted to staff.delete', { user: req.user });
});

export default apiRouter;

