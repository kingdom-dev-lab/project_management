import { Router } from 'express';
import { subDays } from '../utils/time.js';
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

router.get('/stats', async (req, res) => {
  const today = new Date();
  const dayStart = new Date(today);
  dayStart.setHours(0, 0, 0, 0);

  const [projectsTotal, activeTasks, overdueTasks, membersTotal, taskStatus, assignees, doneTasks] = await Promise.all([
    prisma.project.count({ where: { teamId: req.teamId } }),
    prisma.task.count({ where: { teamId: req.teamId, status: { not: 'DONE' } } }),
    prisma.task.count({ where: { teamId: req.teamId, dueDate: { lt: dayStart }, status: { not: 'DONE' } } }),
    prisma.teamMember.count({ where: { teamId: req.teamId } }),
    prisma.task.groupBy({ by: ['status'], where: { teamId: req.teamId }, _count: { status: true } }),
    prisma.taskAssignee.groupBy({ by: ['userId'], where: { task: { teamId: req.teamId } }, _count: { userId: true } }),
    prisma.task.findMany({ where: { teamId: req.teamId, status: 'DONE' }, select: { updatedAt: true } })
  ]);

  const pending = taskStatus
    .filter((entry) => entry.status !== 'DONE')
    .reduce((sum, entry) => sum + entry._count.status, 0);
  const completed = taskStatus
    .filter((entry) => entry.status === 'DONE')
    .reduce((sum, entry) => sum + entry._count.status, 0);

  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const date = subDays(today, 6 - index);
    const key = date.toISOString().slice(0, 10);
    const completedCount = doneTasks.filter((task) => task.updatedAt.toISOString().slice(0, 10) === key).length;
    return { date: key, completed: completedCount };
  });

  const workload = assignees.map((entry) => ({ userId: entry.userId, tasks: entry._count.userId }));

  res.json({
    teamId: req.teamId,
    statCards: {
      totalProjects: projectsTotal,
      activeTasks,
      overdueTasks,
      totalTeamMembers: membersTotal
    },
    progressPie: [
      { name: 'Completed', value: completed },
      { name: 'Pending', value: pending }
    ],
    workload,
    burndown: last7Days
  });
});

export default router;
