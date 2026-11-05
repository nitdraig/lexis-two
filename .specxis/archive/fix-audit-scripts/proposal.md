# Proposal: fix-audit-scripts

## Goal
`specxis-debt` keeps the user's work, and `desx-audit` reports only what it actually evaluated.

## Lazy Check
- Does this need to exist? Yes. The debt sync destroys data, and the audit marks unscanned findings as resolved.
- Does stdlib, the framework, or an installed dep already cover it? `fs` and `git diff --relative` do. No CSS parser: `desx-audit` stays a documented source-level heuristic.
- What is the absolute minimum? A managed block in `debt.md`, word-boundary matching, sorted colors, resolution limited to scanned files.

## Discovery source
- Path: N/A (bug fixes)

## Context
- Affected: `scripts/specxis-debt.js`, `scripts/desx-audit.js`, `tests/desx-audit.test.js`, new `tests/specxis-debt.test.js`.
- Findings: B10, B12, B16-B18, M3a, M7, S14 in [improvement-plan.md](../../improvement-plan.md).

## Out of Scope (YAGNI)
- A real CSS parser or browser computed styles.
- Debt scanning for non-JS languages.
- Measuring the false-positive rate on real projects.

## Open Questions
- None.
