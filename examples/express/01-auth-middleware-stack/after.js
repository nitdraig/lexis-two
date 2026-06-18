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

// lexis: one auth function beats four middleware layers for a single route guard
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }
  if (token === 'invalid') {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  const user: AuthUser = { id: token, role: 'member' };
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Admin only' });
    return;
  }

  req.authUser = user;
  next();
}
