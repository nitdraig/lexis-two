# Tasks: fix-mode-state

> Each task maps to one file or one function, with its test. Do not start until agreed.

## Tasks

- [x] task-001: `mode-tracker.js` command parsing - write only for explicit intensities (B1, B4); drop `specxis` from the regex (S9). Update `tests/hooks.test.js:100`.
- [x] task-002: `mode-tracker.js` deactivation - match the whole trimmed prompt (B5).
- [x] task-003: `mode-tracker.js` change output - include `getLexisInstructions(mode)` in the context (B3).
- [x] task-004: `lexis-two-activate.js` - read `source` from stdin defensively; keep the current flag on `resume` and `compact` (B2). Confirm the payload on Claude Code, Codex and Copilot.
- [x] task-005: `lexis-two-activate.js:43` - skip the nudge on Copilot (B6).
- [x] task-006: `lexis-two-statusline.sh` and `.ps1` - read the flag from `CLAUDE_CONFIG_DIR` when set (B7).
- [x] task-007: `.opencode/plugins/lexis-two.mjs` - use `normalizeMode` in `command.execute.before` (B4); honor `OPENCODE_CONFIG_DIR` in `statePath` (B7).
- [x] task-008: `pi-extension/index.js:269` - apply the same whole-prompt rule (B5).
- [x] task-009: `skills/lexis-two-help/SKILL.md` - create from `.opencode/commands/lexis-two-help.md`, plus the Cursor copy and the route test (B8).
- [x] task-010: `pi-extension/index.js:197` - extract the handler to a local function shared by both commands (B9). Remove the mock's reliance on `pi.commands` for this path.

## Implementation Notes
- `normalizeMode` already rejects `review` while `normalizePersistedMode` accepts it; that is the one-word fix in task-007.
- task-004 is the riskiest: reading stdin adds a hang risk on hosts that keep it open. The hook has a 5s timeout, but a hang must not delay session start.
- Results (all 10 tasks done in one run, at the maintainer's request, instead of one per run):
  - Tests added: 7 in `tests/hooks.test.js` (subcommands leave the flag, mode change carries the definition, whole-prompt deactivation, resume/compact/startup/clear, no hang with open stdin, Copilot/Codex no nudge, bash statusline with CLAUDE_CONFIG_DIR), 3 in `tests/opencode-plugin.test.js`, 2 in `pi-extension/test/extension.test.js` plus an updated deactivation test (the old one asserted that "Please stop lexis now" switches off; it no longer does, by design). `tests/hooks.test.js` review case now asserts D2.
  - NOT confirmed on real hosts: that Claude Code, Codex and Copilot send `source` in the SessionStart payload (task-004 asked to confirm). The hook reads it defensively; a host that sends none behaves as `startup`. Also not run: pi without `pi.commands` on a real pi (only a mock without it), and the PowerShell statusline (the .ps1 edit is a two-line change that was not executed).
  - Behavior to know: `/lexis off` removes the flag file, so a later `resume` finds no flag and applies the default (spec: missing flag falls back to the default).
  - Side effect: `skills/lexis-two-help/SKILL.md` is a new skill, so the plugin now lists 17 skills.

## Lexis Tags Added
