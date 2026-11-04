# Proposal: fix-installer-safety

## Goal
The installer never loses user data, writes only where asked, and does what its help text says.

## Lazy Check
- Does this need to exist? Yes. These are reproduced data loss and writes to the wrong directory.
- Does stdlib, the framework, or an installed dep already cover it? `fs` covers all of it.
- What is the absolute minimum? Unique backup names, a scope check on `stacks/`, a check for remaining hosts, an explicit error without `--yes`.

## Discovery source
- Path: N/A (bug fixes)

## Context
- Affected: `scripts/install.js`, `tests/install.test.js`, `docs/setup.md`.
- Findings: B11, B13, B14, B15, M8a in [improvement-plan.md](../../improvement-plan.md).

## Out of Scope (YAGNI)
- Upgrade tracking and manifests (installer-upgrade).
- Refactoring the planner (simplify-codebase).
- Solving stack profiles under global rules; this spec only stops the wrong write and warns.

## Decisions
- D3: an install without TTY and without `--yes` fails, as documented. Needs a CHANGELOG entry.

## Open Questions
- None.
