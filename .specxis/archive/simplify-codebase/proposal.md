# Proposal: simplify-codebase

## Goal
Remove code and copies that do nothing, with no change in user-visible behavior.

## Lazy Check
- Does this need to exist? Only as deletions. Any task that grows the code should be dropped.
- Does stdlib, the framework, or an installed dep already cover it? Mostly this removes code that duplicates them.
- What is the absolute minimum? Each task stands alone and can be skipped.

## Discovery source
- Path: N/A (refactor)

## Context
- Affected: `bin/`, `scripts/install.js`, `hooks/lexis-two-config.js`, `hooks/lexis-two-instructions.js`, `.cursor/skills/`, `scripts/check-rule-copies.js`, `pi-extension/index.js`, `scripts/desx-audit.js`.
- Findings: S1-S8, S10, S11, S13, S15 in [improvement-plan.md](../../improvement-plan.md).
- Runs last so that specs 1-6 provide the tests that protect it.

## Out of Scope (YAGNI)
- S12, removing six deprecated skills: breaking, deferred to the next major version.
- Removing `lexis-two` command aliases.
- Splitting `install.js` into modules.

## Open Questions
- Why was the `file:.` devDependency added? Task 003 removes it only if tests and OpenCode local loading still work without it.
