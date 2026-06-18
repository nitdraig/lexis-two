# Express — Pagination abstraction

**Problem:** `PaginationService` class with normalize/paginate helpers for a single users list route.

**YAGNI rung:** Follow existing pattern — parse `page` and `limit`, slice the array inline.

**LOC:** 56 → 24 (`before.js` → `after.js`)

**Related command:** `/lexis audit` — find generic helpers used by only one handler.

**Tags:** `// lexis: query params + slice`
