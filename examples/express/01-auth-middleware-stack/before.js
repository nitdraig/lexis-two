import type { NextFunction, Request, Response } from 'express';

type AuthUser = {
  id: string;
  role: 'admin' | 'member';
};

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

function extractBearerToken(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }
  req.headers['x-auth-token'] = token;
  next();
}

function validateToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-auth-token'];
  if (token === 'invalid') {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
  next();
}

function loadUser(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers['x-auth-token'];
  req.authUser = { id: String(token), role: 'member' };
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.authUser?.role !== 'admin') {
    res.status(403).json({ error: 'Admin only' });
    return;
  }
  next();
}

export const adminAuthStack = [
  extractBearerToken,
  validateToken,
  loadUser,
  requireAdmin,
];
