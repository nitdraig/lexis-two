# Express — Error handler factory

**Problem:** `AppError` base class plus three subclasses for 400/401/404 responses.

**YAGNI rung:** No abstraction until third use — attach `status` to a plain `Error` until patterns repeat.

**LOC:** 55 → 28 (`before.js` → `after.js`)

**Related command:** `/lexis debt` — mark error hierarchies with `// lexis: tech debt` when only one route uses them.

**Tags:** `// lexis: status + message until the third error variant`
