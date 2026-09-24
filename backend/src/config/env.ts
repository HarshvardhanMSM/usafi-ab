import dotenv from 'dotenv';
import path from 'path';
import { envSchema, EnvConfig } from '../types/env.types';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const parseEnv = (): EnvConfig => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      '❌ Invalid environment variables:',
      JSON.stringify(parsed.error.format(), null, 2),
    );
    throw new Error('Invalid environment variables configuration');
  }

  return parsed.data;
};

export const env: EnvConfig = parseEnv();
