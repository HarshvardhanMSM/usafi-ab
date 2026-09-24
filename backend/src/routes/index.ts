import { Router } from 'express';
import healthRoutes from './health.routes';

const apiRouter = Router();

// Mount API v1 sub-routes
apiRouter.use('/', healthRoutes);

export default apiRouter;
