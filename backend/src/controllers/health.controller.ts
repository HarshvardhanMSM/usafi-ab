import { Request, Response, NextFunction } from 'express';
import { healthService } from '../services/health.service';
import { sendSuccess } from '../utils/response';

export const getHealth = (_req: Request, res: Response, next: NextFunction): void => {
  try {
    const healthInfo = healthService.getHealthStatus();
    sendSuccess(res, 'Usafi API is running', {
      environment: healthInfo.environment,
    });
  } catch (error) {
    next(error);
  }
};
