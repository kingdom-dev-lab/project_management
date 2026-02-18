import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { resolveTenant } from '../middleware/tenant.js';
import { validate } from '../middleware/validate.js';
import { logActivity } from '../services/activity.js';

const router = Router();
const upload = multer({ dest: 'uploads/' });

const taskSchema = z.object({
  projectId: z.string(),
  title: z.string().min(2),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().datetime().optional(),
  assigneeIds: z.array(z.string()).optional()
});

router.use(requireAuth, resolveTenant);

router.get('/', async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { teamId: req.teamId },
    include: { subtasks: true, comments: true, attachments: true, dependenciesFrom: true, assignees: true }
  });
  res.json(tasks);
});

router.post('/', requireRole('OWNER', 'ADMIN', 'MEMBER'), validate(taskSchema), async (req, res) => {
  const { assigneeIds = [], ...data } = req.body;
  const task = await prisma.task.create({
    data: {
      ...data,
      teamId: req.teamId,
      assignees: { create: assigneeIds.map((userId) => ({ userId })) }
    }
  });
  await logActivity({ teamId: req.teamId, taskId: task.id, userId: req.user.userId, action: 'TASK_CREATED' });
  res.status(201).json(task);
});

router.post('/:id/subtasks', requireRole('OWNER', 'ADMIN', 'MEMBER'), async (req, res) => {
  const subtask = await prisma.subtask.create({ data: { taskId: req.params.id, title: req.body.title } });
  res.status(201).json(subtask);
});

router.post('/:id/dependencies', requireRole('OWNER', 'ADMIN', 'MEMBER'), async (req, res) => {
  const dep = await prisma.taskDependency.create({
    data: { dependentTaskId: req.params.id, prerequisiteTaskId: req.body.prerequisiteTaskId }
  });
  res.status(201).json(dep);
});

router.post('/:id/comments', async (req, res) => {
  const comment = await prisma.comment.create({
    data: { teamId: req.teamId, taskId: req.params.id, userId: req.user.userId, body: req.body.body }
  });
  res.status(201).json(comment);
});

router.post('/:id/attachments', upload.single('file'), async (req, res) => {
  const file = req.file;
  const attachment = await prisma.attachment.create({
    data: {
      teamId: req.teamId,
      taskId: req.params.id,
      fileName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype
    }
  });
  res.status(201).json(attachment);
});

export default router;
