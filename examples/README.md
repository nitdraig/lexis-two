# Lexis-Two Examples

Before/after snippets that show the lazy senior dev ladder in real code. Not runnable apps — copy-paste teaching material.

**How to read:** `before.*` is what a mid-level dev ships under time pressure. `after.*` is the smallest correct fix. Every `after` file has at least one `lexis:` comment (`//` in TS/JS, `#` in Python).

**Comment vocabulary:** [shared/lexis-comment-patterns.md](./shared/lexis-comment-patterns.md)

## Index

| Stack | Case | YAGNI rung | LOC (before → after) | Command |
| ----- | ---- | ---------- | -------------------- | ------- |
| Next.js | [01-modal-library](./nextjs/01-modal-library/) | Native `<dialog>` | 74 → 24 | `/lexis review` |
| Next.js | [02-client-fetch-wrapper](./nextjs/02-client-fetch-wrapper/) | Server Component fetch | 67 → 27 | `/lexis review` |
| Next.js | [03-form-validation-zoo](./nextjs/03-form-validation-zoo/) | HTML5 validation | 49 → 16 | `/lexis audit` |
| Express | [01-auth-middleware-stack](./express/01-auth-middleware-stack/) | One auth function | 55 → 38 | `/lexis review` |
| Express | [02-error-handler-factory](./express/02-error-handler-factory/) | `status` on `Error` | 55 → 28 | `/lexis debt` |
| Express | [03-pagination-abstraction](./express/03-pagination-abstraction/) | Query params + slice | 56 → 24 | `/lexis audit` |
| FastAPI | [01-pydantic-overkill](./fastapi/01-pydantic-overkill/) | One `BaseModel` | 52 → 19 | `/lexis review` |
| FastAPI | [02-custom-cache-layer](./fastapi/02-custom-cache-layer/) | `dict` + TTL | 52 → 25 | `/lexis audit` |
| FastAPI | [03-dependency-injection-maze](./fastapi/03-dependency-injection-maze/) | Module-level wiring | 50 → 32 | `/lexis debt` |

## Legacy markdown examples

Single-file narratives (pre-B1): [sorting.md](./sorting.md), [date-picker.md](./date-picker.md), [email-validation.md](./email-validation.md), [caching.md](./caching.md), [api-endpoint.md](./api-endpoint.md).
