# Proposal: fix-desx

## Goal
`/desx` reports only what it scanned, the findings it reports are real, and re-running it never rewrites history or the user's checkboxes.

## Lazy Check
- Does this need to exist? Yes. In this repo's own audit most findings are false (sibling cards reported as nested), `--json` writes the report, and a one-line edit turns every finding into a "resolved" duplicate.
- Does stdlib, the framework, or an installed dep already cover it? `git ls-files` and `git rev-parse` cover file selection. No CSS parser: `desx-audit` stays a documented source-level heuristic.
- What is the absolute minimum? Fix file selection and CLI input, make the four weakest detectors honest, give findings a stable identity, and disclose coverage.

## Discovery source
- Path: N/A (bug fixes, see the audit)

## Context
- Audit: [audit-specx-desx-slopx.md](../../audit-specx-desx-slopx.md), findings D1 to D12.
- Affected: `scripts/desx-audit.js`, `tests/desx-audit.test.js`, `skills/desx/SKILL.md`, `skills/desx-apply/SKILL.md`, `.cursor/skills` copies, `docs/desx.md`, `DESX.md`, `templates/desx/DESIGN-AUDIT.md`.
- Supersedes the desx half of `fix-audit-scripts` (B12, B16 to B18, M7) so each skill has one spec.
- Interaction: the report format changes (stable identity, English headings). The parser must still read reports written by 1.4.0, including the Spanish headings.

## Out of Scope (YAGNI)
- A real CSS parser or browser computed styles.
- Tailwind class analysis and CSS-in-JS object parsing. The report states they are not covered instead.
- A post-save hook (still not in v1).
- Measuring the false-positive rate across real projects. Calibration here is the fixtures plus this repo's own report.

## Open Questions
- Stable identity: file + category + normalized description + occurrence index is enough for spacing and radius, where the description holds the value. Findings whose text is identical in one file differ only by order. Is that acceptable? Default: yes.
- Should the existing `docs/DESIGN-AUDIT.md` in this repo be regenerated after the fix, or deleted? It is a stale artifact of the 1.4.0 detector. Default: delete it.
