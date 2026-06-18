---
description: "Manage the Specxis Spec-Driven Development lifecycle (new, plan, implement, review, close, debt, status)"
---

Manage the Specxis Spec-Driven Development lifecycle.

Usage:
- `/specxis` or `/specxis status`: Show active specs, tasks progress, and debt.
- `/specxis new <slug>`: Create a new spec folder and proposal.md.
- `/specxis plan <slug>`: Generate spec.md and tasks.md from proposal.md.
- `/specxis implement <slug>`: Implement the next unchecked task.
- `/specxis review <slug>`: Review the implementation against spec.md and AGENTS.md.
- `/specxis close <slug>`: Archive the completed spec and sync its debt.
- `/specxis debt`: Sync all `// lexis:` comments from the codebase to `.specxis/debt.md`.

If `.specxis/` does not exist, suggest running `node node_modules/@draig/lexis-two/scripts/specxis-init.js` (or local script path if in development).

Respond in Spanish.
