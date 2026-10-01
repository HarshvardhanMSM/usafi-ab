import { env } from '../config/env';

export interface ILogger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}

class AppLogger implements ILogger {
  private isDev = env.NODE_ENV === 'development';

  private formatMessage(level: string, message: string, meta?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    if (this.isDev) {
      const metaString = meta ? ` | Meta: ${JSON.stringify(meta)}` : '';
      return `[${timestamp}] [${level.toUpperCase()}]: ${message}${metaString}`;
    }
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...(meta || {}),
    });
  }

  info(message: string, meta?: Record<string, unknown>): void {
    console.info(this.formatMessage('info', message, meta))
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(this.formatMessage('warn', message, meta));
  }

  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    const errorDetails =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: this.isDev ? error.stack : undefined }
        : error;

    const mergedMeta = { ...(meta || {}), error: errorDetails };

    console.error(this.formatMessage('error', message, mergedMeta));
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (this.isDev) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }
}

export const logger: ILogger = new AppLogger();
