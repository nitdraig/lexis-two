---
description: "Manage the Specxis Spec-Driven Development lifecycle (new, plan, implement, review, close, debt, status)"
---

Manage the Specxis Spec-Driven Development lifecycle.

Short alias: `/specx` (same as `/specxis`).

Usage:
- `/specxis` or `/specx` or `/specxis status`: Show active specs, tasks progress, and debt.
- `/specxis new <slug>`: Create a new spec folder and proposal.md. Soft gate: if the idea is a vague new product and `docs/discovery/<slug>/01-mvp.md` is missing, suggest `/discx <slug>` first (bypass with `sin discovery`). Never nag for bugs or one-file fixes.
- `/specxis plan <slug>`: Generate spec.md and tasks.md from proposal.md.
- `/specxis implement <slug>`: Implement the next unchecked task.
- `/specxis review <slug>`: Review the implementation against spec.md and AGENTS.md.
- `/specxis close <slug>`: Archive the completed spec and sync its debt.
- `/specxis debt`: Sync all `// lexis:` comments from the codebase to `.specxis/debt.md`.

If `.specxis/` does not exist, suggest running `node node_modules/@draig/lexis-two/scripts/specxis-init.js` (or local script path if in development).

Respond in Spanish.
