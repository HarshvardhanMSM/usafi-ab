import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './utils/logger';

let server: http.Server;

const startServer = async (): Promise<void> => {
  try {
    // 1. Connect to PostgreSQL database via Prisma
    await connectDatabase();

    // 2. Start HTTP server
    server = app.listen(env.PORT, () => {
      logger.info(`🚀 Usafi API server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`📚 Swagger docs available at http://localhost:${env.PORT}/api/docs`);
      logger.info(`💚 Health endpoint at http://localhost:${env.PORT}/api/v1/health`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server', error);
    process.exit(1);
  }
};

const handleShutdown = async (signal: string): Promise<void> => {
  logger.warn(`⚠️ Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('🔒 Closed HTTP server');
      await disconnectDatabase();
      logger.info('👋 Graceful shutdown completed');
      process.exit(0);
    });

    // Fallback timeout force exit if shutdown gets stuck
    setTimeout(() => {
      logger.error('❌ Forced shutdown due to timeout');
      process.exit(1);
    }, 10000);
  } else {
    await disconnectDatabase();
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('❌ Unhandled Rejection detected:', reason);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('❌ Uncaught Exception detected:', error);
  handleShutdown('uncaughtException');
});

startServer();
