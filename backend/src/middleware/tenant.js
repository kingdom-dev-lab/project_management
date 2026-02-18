import { prisma } from '../config/prisma.js';

export async function resolveTenant(req, res, next) {
  const requestedTeamId = req.headers['x-team-id'];

  if (requestedTeamId) {
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: requestedTeamId, userId: req.user.userId } }
    });

    if (!membership) return res.status(403).json({ message: 'No team access' });

    req.teamId = requestedTeamId;
    req.teamRole = membership.role;
    return next();
  }

  const fallbackMembership = await prisma.teamMember.findFirst({
    where: { userId: req.user.userId },
    orderBy: { createdAt: 'asc' }
  });

  if (!fallbackMembership) {
    return res.status(403).json({ message: 'No team membership found. Run setup first.' });
  }

  req.teamId = fallbackMembership.teamId;
  req.teamRole = fallbackMembership.role;
  return next();
}
