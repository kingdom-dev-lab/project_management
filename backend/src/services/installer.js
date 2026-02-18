import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma.js';

const rootDir = path.resolve(process.cwd(), '..');
const envFilePath = path.join(rootDir, '.env');

export async function isInstalled() {
  try {
    const install = await prisma.installation.findUnique({ where: { id: 'default' } });
    return Boolean(install?.isComplete);
  } catch {
    return false;
  }
}

export async function runInstallation(payload) {
  const {
    systemName,
    dbHost,
    dbName,
    dbUser,
    dbPassword,
    adminEmail,
    adminPassword
  } = payload;

  const databaseUrl = `postgresql://${dbUser}:${encodeURIComponent(dbPassword)}@${dbHost}:5432/${dbName}`;

  const envContent = [
    `SYSTEM_NAME=${systemName}`,
    `DATABASE_URL=${databaseUrl}`,
    'INSTALLATION_COMPLETE=true',
    'PORT=4000',
    'JWT_SECRET=change_me',
    'JWT_REFRESH_SECRET=change_me_refresh',
    'NEXT_PUBLIC_API_URL=http://localhost:4000',
    'FRONTEND_URL=http://localhost:3000'
  ].join('\n');

  await fs.writeFile(envFilePath, envContent, 'utf8');

  execSync('npm run migrate --workspace backend', { cwd: rootDir, stdio: 'inherit' });

  const hashed = await bcrypt.hash(adminPassword, 10);
  const owner = await prisma.user.create({
    data: { email: adminEmail, fullName: 'System Owner', passwordHash: hashed }
  });

  const team = await prisma.team.create({ data: { name: `${systemName} Team`, slug: 'default-team' } });

  await prisma.teamMember.create({
    data: { teamId: team.id, userId: owner.id, role: 'OWNER' }
  });

  await prisma.installation.upsert({
    where: { id: 'default' },
    update: { isComplete: true, systemName },
    create: { id: 'default', systemName, isComplete: true }
  });

  return { ok: true };
}
