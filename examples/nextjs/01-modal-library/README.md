# Next.js — Modal library vs `<dialog>`

**Problem:** Confirm-delete UI built as a reusable `Modal` with portal, scroll lock, and keyboard handlers.

**YAGNI rung:** Native platform — the browser ships `<dialog>` with `showModal()`, backdrop, focus trap, and Escape.

**LOC:** 74 → 24 (`before.tsx` → `after.tsx`)

**Related command:** `/lexis review` — ask if a custom overlay beats `<dialog>` or a one-off confirm.

**Tags:** `// lexis: native <dialog> instead of modal library`
