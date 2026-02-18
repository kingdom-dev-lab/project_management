import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const teamSchema = z.object({ name: z.string().min(2), slug: z.string().min(2) });

router.get('/', requireAuth, async (req, res) => {
  const teams = await prisma.teamMember.findMany({
    where: { userId: req.user.userId },
    include: { team: true }
  });
  res.json(teams.map((m) => ({ ...m.team, role: m.role })));
});

router.post('/', requireAuth, validate(teamSchema), async (req, res) => {
  const team = await prisma.team.create({ data: req.body });
  await prisma.teamMember.create({ data: { teamId: team.id, userId: req.user.userId, role: 'OWNER' } });
  res.status(201).json(team);
});

export default router;
