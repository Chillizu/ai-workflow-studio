import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
// 尝试加载根目录的 .env 文件 (用于开发环境和 Docker)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
// 如果根目录没有，尝试加载 server 目录下的 .env
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  HOST: z.string().default('0.0.0.0'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  ENCRYPTION_KEY: z.string().min(32, 'Encryption key must be at least 32 characters long').default('development-encryption-key-abc12345'),
  UPLOAD_DIR: z.string().default('./uploads'),
  DATA_DIR: z.string().default('./data'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(_env.error.format(), null, 4));
  process.exit(1);
}

export const env = _env.data;
