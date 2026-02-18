import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { validate } from '../middleware/validate.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

router.post('/login', validate(loginSchema), async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(req.body.password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  res.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, fullName: user.fullName } });
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' });

  try {
    const payload = verifyRefreshToken(refreshToken);
    const tokenInDb = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!tokenInDb) return res.status(401).json({ message: 'Invalid refresh token' });

    const accessToken = signAccessToken({ userId: payload.userId });
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

export default router;
