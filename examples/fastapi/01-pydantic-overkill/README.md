# FastAPI — Pydantic model zoo vs one payload

**Problem:** POST `/users` splits input across three nested models with cross-field validators for a single create flow.

**YAGNI rung:** One line if possible — one `BaseModel` until another endpoint shares the same shape.

**LOC:** 52 → 19 (`before.py` → `after.py`)

**Related command:** `/lexis review` — ask whether nested DTOs earn their keep on day one.

**Tags:** `// lexis: one model per endpoint`
