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
  res.json(projects);
});

router.post('/', requireRole('OWNER', 'ADMIN', 'MEMBER'), validate(projectSchema), async (req, res) => {
  const project = await prisma.project.create({ data: { ...req.body, teamId: req.teamId } });
  res.status(201).json(project);
});

router.put('/:id', requireRole('OWNER', 'ADMIN', 'MEMBER'), validate(projectSchema.partial()), async (req, res) => {
  const project = await prisma.project.update({ where: { id: req.params.id }, data: req.body });
  res.json(project);
});

router.delete('/:id', requireRole('OWNER', 'ADMIN'), async (req, res) => {
  await prisma.project.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
