import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const fallbackSecret = crypto.createHash('sha256').update('local-dev-secret').digest('hex');

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:4000',
  databaseUrl: process.env.DATABASE_URL || 'file:./backend/prisma/dev.db',
  jwtSecret: process.env.JWT_SECRET || fallbackSecret,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || `${fallbackSecret}_refresh`,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  installationComplete: process.env.INSTALLATION_COMPLETE === 'true',
  nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
};
