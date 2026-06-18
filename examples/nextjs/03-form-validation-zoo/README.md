# Next.js — Form validation zoo vs HTML5

**Problem:** Two-field contact form wired with Zod, react-hook-form, and a custom resolver.

**YAGNI rung:** Stdlib / HTML first — `required`, `type="email"`, and `minLength` cover the requirement.

**LOC:** 49 → 16 (`before.tsx` → `after.tsx`)

**Related command:** `/lexis audit` — hunt for validation libraries on forms with fewer than five fields.

**Tags:** `// lexis: HTML5 validation first`
