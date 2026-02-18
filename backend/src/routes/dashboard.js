import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { resolveTenant } from '../middleware/tenant.js';

const router = Router();
router.use(requireAuth, resolveTenant);

router.get('/', async (req, res) => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const [dueToday, overdue, tasks, projects] = await Promise.all([
    prisma.task.count({ where: { teamId: req.teamId, dueDate: { gte: start, lte: end } } }),
    prisma.task.count({ where: { teamId: req.teamId, dueDate: { lt: start }, status: { not: 'DONE' } } }),
    prisma.task.findMany({ where: { teamId: req.teamId }, include: { assignees: true } }),
    prisma.project.findMany({ where: { teamId: req.teamId }, include: { tasks: true } })
  ]);

  const workload = tasks.reduce((acc, task) => {
    task.assignees.forEach((a) => {
      acc[a.userId] = (acc[a.userId] || 0) + 1;
    });
    return acc;
  }, {});

  const projectProgress = projects.map((p) => {
    const total = p.tasks.length || 1;
    const done = p.tasks.filter((t) => t.status === 'DONE').length;
    return { projectId: p.id, name: p.name, progress: Math.round((done / total) * 100) };
  });

  res.json({ dueToday, overdue, workload, projectProgress });
});

export default router;
