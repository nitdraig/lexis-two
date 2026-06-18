# Express — Auth middleware stack

**Problem:** Four chained middlewares to parse a Bearer token and check admin role for one route.

**YAGNI rung:** Deletion over addition — one function at the route is enough until a third reuse appears.

**LOC:** 55 → 38 (`before.js` → `after.js`)

**Related command:** `/lexis review` — count middleware files added for a single endpoint.

**Tags:** `// lexis: one auth function beats four middleware layers`
