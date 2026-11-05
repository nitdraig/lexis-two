# Proposal: fix-specx

## Goal
A spec's status is always true, implementation starts only after approval, and review, close and the debt ledger never lose or misread the user's work.

## Lazy Check
- Does this need to exist? Yes. The skill promises a lifecycle (draft, agreed, implementing, done) that no step writes, and `specxis-debt` overwrites the ledger it claims to maintain.
- Does stdlib, the framework, or an installed dep already cover it? `git` records the base commit; `fs` covers the managed block. No new dependency.
- What is the absolute minimum? Four status writes in the skill, one gate, one recorded base commit, checkbox findings in the review template, and a non-destructive debt script.

## Discovery source
- Path: N/A (bug fixes and process gaps, see the audit)

## Context
- Audit: [audit-specx-desx-slopx.md](../../audit-specx-desx-slopx.md), findings X1 to X10.
- Affected: `skills/specxis/SKILL.md` (+ `.cursor/skills` copy), `.opencode/commands/specxis.md`, `.opencode/commands/specx.md`, `scripts/specxis-debt.js`, `scripts/specxis-init.js`, `templates/specxis/*`, `SPECXIS.md`, `docs/specxis.md`, README line on "max 10 tasks".
- Supersedes the specxis half of `fix-audit-scripts` (B10, M3a, S14) and moves the `specxis-init` and template items out of `ci-and-housekeeping` (M3b, M8b), so each skill has one spec.
- Design call: keep the lifecycle model-driven in the skill text. A status script is not added (YAGNI); the skill states the exact line to write.
- Task wording: the "one file or function per task" rule is what makes specs long. This spec asks to change it to "one concern per task, tests inside it". It is a product-doc change, so it is a SHOULD, decided at review.

## Out of Scope (YAGNI)
- A `/specx amend` command. Re-running `plan` on a spec that already has checked tasks keeps them; that is enough.
- A status script or a TUI board.
- Per-session mode or multi-user locking of `.specxis/`.
- Changing the Discovery gate beyond making its keyword handling consistent with the language setting.

## Open Questions
- Approval step: the skill asks the user at the end of `plan` and writes `agreed` on a yes. Is a separate `/specx approve <slug>` expected? Default: no.
- Should `close` accept a waiver for criteria that cannot be verified (for example "works in a real host session")? This spec says yes, recorded as a line in `review.md`.
