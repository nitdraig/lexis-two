import type { NextFunction, Request, Response } from 'express';

type HttpError = Error & { status?: number };

// lexis: status + message until the third error variant proves a hierarchy is worth it
export function errorHandler(
  error: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status = error.status ?? 500;
  const message = status === 500 ? 'Internal server error' : error.message;
  res.status(status).json({ error: message });
}

export function getUserHandler(req: Request, res: Response, next: NextFunction) {
  const id = req.params.id;
  if (!id) {
    next(Object.assign(new Error('Missing id'), { status: 400 }));
    return;
  }
  if (id === 'missing') {
    next(Object.assign(new Error('User not found'), { status: 404 }));
    return;
  }
  res.json({ id, name: 'Ada' });
}
