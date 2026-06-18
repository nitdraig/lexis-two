import type { Request, Response } from 'express';

type PaginationInput = {
  page: number;
  pageSize: number;
  total: number;
};

type PaginationResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

class PaginationService {
  normalize(input: Partial<PaginationInput>): PaginationInput {
    const page = Math.max(1, input.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, input.pageSize ?? 20));
    return { page, pageSize, total: input.total ?? 0 };
  }

  paginate<T>(items: T[], input: Partial<PaginationInput>): PaginationResult<T> {
    const { page, pageSize, total } = this.normalize({ ...input, total: items.length });
    const start = (page - 1) * pageSize;
    const slice = items.slice(start, start + pageSize);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
      items: slice,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}

const pagination = new PaginationService();

export function listUsersHandler(req: Request, res: Response) {
  const users = Array.from({ length: 45 }, (_, index) => ({
    id: String(index + 1),
    name: `User ${index + 1}`,
  }));

  const result = pagination.paginate(users, {
    page: Number(req.query.page),
    pageSize: Number(req.query.limit),
  });

  res.json(result);
}
