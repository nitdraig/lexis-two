# Next.js — Client fetch wrapper vs Server Component

**Problem:** Read-only user list fetched in a client component with custom hook, loading, and error state.

**YAGNI rung:** Existing stack feature — App Router Server Components can `await fetch()` on the server.

**LOC:** 67 → 27 (`before.tsx` → `after.tsx`)

**Related command:** `/lexis review` — check if the data is truly interactive before adding `'use client'`.

**Tags:** `// lexis: Server Component fetch`
