import type { NextFunction, Request, Response } from 'express';

export class AppError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super('Unauthorized', 401);
  }
}

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}

export function getUserHandler(req: Request, res: Response, next: NextFunction) {
  const id = req.params.id;
  if (!id) {
    next(new ValidationError('Missing id'));
    return;
  }
  if (id === 'missing') {
    next(new NotFoundError('User'));
    return;
  }
  res.json({ id, name: 'Ada' });
}
