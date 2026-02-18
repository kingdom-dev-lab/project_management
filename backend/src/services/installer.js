import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');
const envFilePath = path.join(rootDir, '.env');
const sqliteDbPath = path.resolve(__dirname, '../../prisma/dev.db');

async function ensureDatabaseInitialized() {
  await fs.mkdir(path.dirname(sqliteDbPath), { recursive: true });

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Installation" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "systemName" TEXT NOT NULL,
      "installedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "isComplete" BOOLEAN NOT NULL DEFAULT false
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "passwordHash" TEXT NOT NULL,
      "fullName" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Team" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL UNIQUE,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "TeamMember" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "teamId" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'MEMBER',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "TeamMember_teamId_userId_key" ON "TeamMember"("teamId", "userId");');
}

function getEnvContent(systemName) {
  return [
    'NODE_ENV=development',
    `SYSTEM_NAME=${systemName}`,
    'PORT=4000',
    'DATABASE_URL=file:./backend/prisma/dev.db',
    'JWT_SECRET=replace_with_strong_secret',
    'JWT_REFRESH_SECRET=replace_with_strong_refresh_secret',
    'ACCESS_TOKEN_EXPIRES_IN=15m',
    'REFRESH_TOKEN_EXPIRES_IN=7d',
    'INSTALLATION_COMPLETE=true',
    'FRONTEND_URL=http://localhost:3000',
    'NEXT_PUBLIC_API_URL=http://localhost:4000',
    'UPLOAD_DRIVER=local',
    'UPLOAD_LOCAL_PATH=uploads',
    'S3_REGION=',
    'S3_BUCKET=',
    'S3_ACCESS_KEY_ID=',
    'S3_SECRET_ACCESS_KEY='
  ].join('\n');
}

export async function isInstalled() {
  try {
    await ensureDatabaseInitialized();
    const install = await prisma.installation.findUnique({ where: { id: 'default' } });
    return Boolean(install?.isComplete);
  } catch {
    return false;
  }
}

export async function runInstallation(payload) {
  const { systemName, adminEmail, adminPassword } = payload;
  await ensureDatabaseInitialized();

  const envContent = getEnvContent(systemName);
  await fs.writeFile(envFilePath, envContent, 'utf8');

  const hashed = await bcrypt.hash(adminPassword, 12);

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({ where: { email: adminEmail } });
    const owner = existing
      ? await tx.user.update({ where: { id: existing.id }, data: { passwordHash: hashed } })
      : await tx.user.create({ data: { email: adminEmail, fullName: 'System Owner', passwordHash: hashed } });

    const team = await tx.team.create({
      data: {
        name: 'Initial Team',
        slug: `initial-team-${Date.now()}`
      }
    });

    await tx.teamMember.upsert({
      where: { teamId_userId: { teamId: team.id, userId: owner.id } },
      update: { role: 'OWNER' },
      create: { teamId: team.id, userId: owner.id, role: 'OWNER' }
    });

    await tx.installation.upsert({
      where: { id: 'default' },
      update: { isComplete: true, systemName },
      create: { id: 'default', systemName, isComplete: true }
    });

    return { ownerId: owner.id, teamId: team.id };
  });

  return { ok: true, ...result, databaseFile: sqliteDbPath };
}
