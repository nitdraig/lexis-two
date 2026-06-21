---
name: lexis-two-scenario
description: Walk through concrete scenarios before designing or coding
---

Before design or code, walk **3 scenarios** for the requested feature:

1. **Happy path** — minimal user action, expected outcome (3–5 lines, concrete data).
2. **Edge** — boundary input or permission edge (what breaks if ignored).
3. **Failure** — one realistic failure (network, validation, concurrency) and expected UX/error.

Then:

- **Minimum scope:** what all three scenarios need in common (that's v1).
- **Defer:** what only edge/failure needs — skip for v1 unless user insists.
- **Open question:** one line if scenarios conflict.

No code unless the user already asked for implementation. No new dependencies in the plan.

Respond in Spanish.
