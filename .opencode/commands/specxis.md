---
description: "Manage the Specxis Spec-Driven Development lifecycle (new, plan, implement, review, close, debt, status)"
---

Manage the Specxis Spec-Driven Development lifecycle.

Short alias: `/specx` (same as `/specxis`).

Usage:
- `/specxis` or `/specx` or `/specxis status`: Show active specs, tasks progress, and debt.
- `/specxis new <slug>`: Create a new spec folder and proposal.md. Soft gate: if the idea is a vague new product and `docs/discovery/<slug>/01-mvp.md` is missing, suggest `/discx <slug>` first (bypass with `no discovery` or `sin discovery`). Never nag for bugs or one-file fixes.
- `/specxis plan <slug>`: Generate spec.md (Status: draft) and tasks.md from proposal.md; on approval the status becomes agreed.
- `/specxis implement <slug>`: Implement the next unchecked task. Refuses unless the spec is agreed; records the base commit on the first run.
- `/specxis review <slug>`: Review the diff since the base commit against spec.md and AGENTS.md; findings are checkboxes.
- `/specxis close <slug>`: Needs a review and no open High/Critical findings (waivers for unverifiable criteria); sets Status: done, archives, syncs debt.
- `/specxis debt`: Sync all `// lexis:` comments from the codebase to `.specxis/debt.md`.

If `.specxis/` does not exist, suggest running `node node_modules/@draig/lexis-two/scripts/specxis-init.js` (or local script path if in development).

Respond in the user's language unless the project's rules set one.
