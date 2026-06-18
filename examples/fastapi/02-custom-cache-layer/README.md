# FastAPI — Redis cache wrapper vs in-memory TTL

**Problem:** Single-user CLI tool wraps Redis with a decorator class for one `GET /users/{id}` lookup.

**YAGNI rung:** Map before Redis — `dict` + TTL until another process needs the same cache.

**LOC:** 52 → 25 (`before.py` → `after.py`)

**Related command:** `/lexis audit` — flag infra (Redis) on a path with one reader and one writer.

**Tags:** `// lexis: in-memory Map + TTL`
