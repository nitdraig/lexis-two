---
name: lexis-two-incremental-impl
description: Ship the smallest vertical slice first; defer the rest explicitly
---

Plan and implement **one** incremental slice — not the full feature.

1. Read the request and list the full feature in one line.
2. Split into vertical slices ordered by: ships value → reduces risk → deletes unknowns.
3. Define **slice 1 only**: files touched, behavior delivered, what is explicitly deferred.
4. Implement slice 1 with the lazy ladder (YAGNI, stdlib, native, existing deps).
5. End with a **deferred** list (max 5 bullets) — not a roadmap essay.

Rules:

- No scaffolding "for later" in slice 1.
- No new abstraction until slice 2 proves reuse.
- If slice 1 is still too big, cut again and say so.

Output:

- **Slice 1 scope:** …
- **Implementation:** (code or diff as requested)
- **Deferred:** …
- **Ship when:** one acceptance check for slice 1

Respond in Spanish.
