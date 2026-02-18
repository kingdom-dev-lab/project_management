import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { isInstalled, runInstallation } from '../services/installer.js';

const router = Router();

const setupSchema = z.object({
  systemName: z.string().min(2),
  dbHost: z.string().min(2),
  dbName: z.string().min(1),
  dbUser: z.string().min(1),
  dbPassword: z.string().min(1),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8)
});

router.get('/status', async (_, res) => {
  const installed = await isInstalled();
  res.json({ installed });
});

router.post('/', validate(setupSchema), async (req, res) => {
  const installed = await isInstalled();
  if (installed) return res.status(409).json({ message: 'Already installed' });

  await runInstallation(req.body);
  res.status(201).json({ message: 'Installation complete' });
});

export default router;
