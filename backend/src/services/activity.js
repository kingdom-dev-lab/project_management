import { prisma } from '../config/prisma.js';

export async function logActivity({ teamId, taskId, userId, action, metadata }) {
  return prisma.activityLog.create({ data: { teamId, taskId, userId, action, metadata } });
}
