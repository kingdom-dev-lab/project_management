import { verifyAccessToken } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token' });
  try {
    req.user = verifyAccessToken(header.slice(7));
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.teamRole || !roles.includes(req.teamRole)) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  return next();
};
