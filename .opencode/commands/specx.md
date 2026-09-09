---
description: "Specxis short alias (/specx). Same as /specxis."
---

Manage the Specxis Spec-Driven Development lifecycle. Short name: `/specx`. Full name: `/specxis`.

Handle: $ARGUMENTS

Usage (same as `/specxis`):
- `/specx` or `/specx status`: Show active specs, tasks progress, and debt.
- `/specx new <slug>`: Create a new spec folder and proposal.md. Soft gate: if the idea is a vague new product and `docs/discovery/<slug>/01-mvp.md` is missing, suggest `/discx <slug>` first (bypass with `sin discovery`). Never nag for bugs or one-file fixes.
- `/specx plan <slug>`: Generate spec.md and tasks.md from proposal.md.
- `/specx implement <slug>`: Implement the next unchecked task.
- `/specx review <slug>`: Review the implementation against spec.md and AGENTS.md.
- `/specx close <slug>`: Archive the completed spec and sync its debt.
- `/specx debt`: Sync `// lexis:` comments to `.specxis/debt.md`.

If `.specxis/` does not exist, suggest `node node_modules/@draig/lexis-two/scripts/specxis-init.js` (or the local script in development).

Follow `skills/specxis/SKILL.md`. Respond in Spanish.
