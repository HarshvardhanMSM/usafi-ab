import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import apiRouter from './routes';
import { setupSwagger } from './docs/swagger';
import { notFoundHandler } from './middleware/notFound.middleware';
import { globalErrorHandler } from './middleware/error.middleware';

export const createApp = (): Express => {
  const app: Express = express();

  // Security headers middleware
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: env.ADMIN_FRONTEND_URL ? [env.ADMIN_FRONTEND_URL, 'http://localhost:3000'] : '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Swagger Documentation Route
  setupSwagger(app);

  // Mount API Version 1 Routes
  app.use('/api/v1', apiRouter);

  // 404 Handler
  app.use(notFoundHandler);

  // Centralized Error Handler
  app.use(globalErrorHandler);

  return app;
};

export const app = createApp();
