---
description: "Specxis short alias (/specx). Same as /specxis."
---

Manage the Specxis Spec-Driven Development lifecycle. Short name: `/specx`. Full name: `/specxis`.

Handle: $ARGUMENTS

Usage (same as `/specxis`):
- `/specx` or `/specx status`: Show active specs, tasks progress, and debt.
- `/specx new <slug>`: Create a new spec folder and proposal.md. Soft gate: if the idea is a vague new product and `docs/discovery/<slug>/01-mvp.md` is missing, suggest `/discx <slug>` first (bypass with `no discovery` or `sin discovery`). Never nag for bugs or one-file fixes.
- `/specx plan <slug>`: Generate spec.md (Status: draft) and tasks.md from proposal.md; on approval the status becomes agreed.
- `/specx implement <slug>`: Implement the next unchecked task. Refuses unless the spec is agreed; records the base commit on the first run.
- `/specx review <slug>`: Review the diff since the base commit against spec.md and AGENTS.md; findings are checkboxes.
- `/specx close <slug>`: Needs a review and no open High/Critical findings (waivers for unverifiable criteria); sets Status: done, archives, syncs debt.
- `/specx debt`: Sync `// lexis:` comments to `.specxis/debt.md`.

If `.specxis/` does not exist, suggest `node node_modules/@draig/lexis-two/scripts/specxis-init.js` (or the local script in development).

Follow `skills/specxis/SKILL.md`. Respond in the user's language unless the project's rules set one.
