# FastAPI — Depends maze vs module-level wiring

**Problem:** Two repositories and one service wired through four `Depends()` factories for a single route.

**YAGNI rung:** KISS — construct services once at import time until tests need swap-in fakes.

**LOC:** 50 → 32 (`before.py` → `after.py`)

**Related command:** `/lexis debt` — mark DI depth to revisit when integration tests multiply.

**Tags:** `// lexis: plain wiring`
