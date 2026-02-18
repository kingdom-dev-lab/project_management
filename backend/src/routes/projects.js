import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { resolveTenant } from '../middleware/tenant.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const projectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional()
});

router.use(requireAuth, resolveTenant);

router.get('/', async (req, res) => {
  const projects = await prisma.project.findMany({ where: { teamId: req.teamId }, include: { tasks: true } });
  res.json({ teamId: req.teamId, items: projects });
});

router.post('/', requireRole('OWNER', 'ADMIN', 'MEMBER'), validate(projectSchema), async (req, res) => {
  const project = await prisma.project.create({
    data: {
      name: req.body.name,
      description: req.body.description,
      status: req.body.status,
      startDate: req.body.startDate ? new Date(req.body.startDate) : null,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
      teamId: req.teamId
    }
  });

  res.status(201).json(project);
});

router.put('/:id', requireRole('OWNER', 'ADMIN', 'MEMBER'), validate(projectSchema.partial()), async (req, res) => {
  const existing = await prisma.project.findFirst({ where: { id: req.params.id, teamId: req.teamId } });
  if (!existing) return res.status(404).json({ message: 'Project not found' });

  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: {
      ...req.body,
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined
    }
  });
  res.json(project);
});

router.delete('/:id', requireRole('OWNER', 'ADMIN'), async (req, res) => {
  const existing = await prisma.project.findFirst({ where: { id: req.params.id, teamId: req.teamId } });
  if (!existing) return res.status(404).json({ message: 'Project not found' });

  await prisma.project.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
