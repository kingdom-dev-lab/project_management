import { prisma } from '../config/prisma.js';

export async function resolveTenant(req, res, next) {
  const teamId = req.headers['x-team-id'];
  if (!teamId) return res.status(400).json({ message: 'x-team-id header required' });

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: req.user.userId } }
  });

  if (!membership) return res.status(403).json({ message: 'No team access' });

  req.teamId = teamId;
  req.teamRole = membership.role;
  next();
}
