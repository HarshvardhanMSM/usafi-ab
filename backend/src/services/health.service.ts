import { env } from '../config/env';

export interface HealthStatus {
  environment: string;
  timestamp: string;
  uptime: number;
}

export class HealthService {
  public getHealthStatus(): HealthStatus {
    return {
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}

export const healthService = new HealthService();
