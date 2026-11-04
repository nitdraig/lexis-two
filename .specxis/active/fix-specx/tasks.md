# Tasks: fix-specx

> Grouped by concern, each with its own tests. Do not start until agreed.

## Tasks

- [x] task-001: Debt script - `scripts/specxis-debt.js` and new `tests/specxis-debt.test.js`. `require.main` guard and exports; managed block with preserved outside content and `[x]` state keyed by file plus comment text; whole-word classifier; `withFileTypes`, skip symlinks, per-file read errors; write only after a complete scan; remove the unused `debtContent`. One test per audit repro (X4).
- [x] task-002: Init script - `scripts/specxis-init.js` and a test. Guard and exports, drop the `.gitignore` edit, current command names, idempotent second run (X7, X9).
- [x] task-003: Templates - `templates/specxis/{proposal,spec,tasks,review}.md`. Status line, `Base commit:` field in tasks, checkbox findings with severity in review, waiver line, constraints from the stack profile instead of "TypeScript: strict", current command names, the new task wording (X1, X3, X5, X6, X7).
- [x] task-004: Skill lifecycle - `skills/specxis/SKILL.md` and its `.cursor/skills` copy, `.opencode/commands/specxis.md`, `.opencode/commands/specx.md`. The four status writes, the `implement` gate, base commit recording, review and close rules, slug validation, archive collision, re-plan keeps checked tasks, bilingual Discovery triggers. Run `check-rule-copies.js` and `claude plugin validate .` (X1, X2, X3, X5, X8, X10).
- [x] task-005: Docs - `SPECXIS.md`, `docs/specxis.md`, the README line on tasks, `CHANGELOG.md`. Same wording as the skill; describe the lifecycle states and the base commit (X6).
- [x] task-006: Walk-through - run the acceptance walk-through in a scratch project and record each step's result under Implementation Notes. Fix what it shows.

## Implementation Notes
- Order: 001 and 002 are independent of the skill text; 003 before 004 because the skill references the template fields; 005 after 004.
- Because the skill is model-driven, its acceptance is the recorded walk-through, not unit tests. Be explicit in the notes about what was run by a model and what by a script.
- The scratch walk-through needs git commits; the global commit hook asks for `git add` and `git commit` as separate commands.
- `fix-audit-scripts` is superseded by this spec and `fix-desx`; do not implement it.
- Walk-through results (task-006). Run by me following the skill text step by step in a scratch project, with the scripts run for real; not by a fresh agent session. The model-driven steps (status writes, the implement gate, review wording) are therefore checked by reading, not executed independently.
  - Ran for real: init (idempotent, no `.gitignore` edit); template copy (spec starts as `Status: draft`, tasks carry the `Base commit:` placeholder); debt sync (a note outside the block kept, a single block after three syncs, entry written with `file:line`); slug regex (accepts `user-auth` and `ok1`; rejects `Bad_Slug`, `../x`, `a--b`); diff against the empty tree in a repo with no history (works for staged files; `git rev-parse HEAD` fails there, so the base is recorded as `none`).
  - Not run: the checkpoint-then-review case. Saving a checkpoint in the scratch repo was blocked by the global git hook (gitleaks is not installed on this machine) and I did not bypass it. That a diff against `HEAD` empties after a checkpoint while a diff against a recorded base does not is git semantics, not something this walk-through exercised.
  - Not run: refusal of `implement` on a `draft` spec, and refusal of `close` on an open High finding. Both are instructions in the skill, not code.
  - Change made because of the walk-through: for a base of `none` the skill now also tells the reader to check untracked files, since a tree diff covers only tracked and staged files.

## Lexis Tags Added
