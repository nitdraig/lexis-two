import type { Request, Response } from 'express';

// lexis: query params + slice — skip PaginationService until a third list endpoint needs it
export function listUsersHandler(req: Request, res: Response) {
  const users = Array.from({ length: 45 }, (_, index) => ({
    id: String(index + 1),
    name: `User ${index + 1}`,
  }));

  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const start = (page - 1) * pageSize;
  const items = users.slice(start, start + pageSize);
  const totalPages = Math.ceil(users.length / pageSize);

  res.json({
    items,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  });
}
