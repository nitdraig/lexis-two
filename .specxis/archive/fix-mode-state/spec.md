# Spec: fix-mode-state

> Status: done

## Requirements

### MUST (non-negotiable)
- [x] `/lexis <lite|full|ultra|off>` is the only `/lexis` form that writes the flag.
- [x] Bare `/lexis`, `status`, `plan`, `help`, `audit`, `debt`, `security` leave the flag untouched.
- [x] (D2) `/lexis review` and its aliases leave the flag untouched, in the tracker and in OpenCode.
- [x] A SessionStart with source `resume` or `compact` keeps the current mode; `startup` and `clear` apply the default.
- [x] A missing flag on resume falls back to the default mode.
- [x] The activate hook cannot hang when the host provides no stdin.
- [x] Deactivation fires only when the whole prompt is the phrase: `normal mode` still works, a sentence containing it does not. Same in pi.
- [x] A mode change gives the model that level's definition.
- [x] Copilot sessions get no statusline nudge.
- [x] Statuslines honor `CLAUDE_CONFIG_DIR`; the OpenCode plugin honors `OPENCODE_CONFIG_DIR`.
- [x] Pi `/lexis`, `/lexis help` and `/lexis-two-help` resolve to an existing skill.
- [x] Pi `/lexis-two` works without `pi.commands`.

### SHOULD (strong preference, can deviate with // lexis: comment)
- [x] A test asserts every pi skill route points to an existing `skills/<id>/SKILL.md`.

### MAY (optional, implement only if trivial)
- [x] None.

## Constraints
- Language: plain JS. No new dependencies.
- Hooks must fail silently: never block a session.

## Acceptance Criteria
- [x] With `ultra` active: `/lexis status`, `/lexis plan x`, `/lexis help`, `/lexis review` leave the flag at `ultra`.
- [x] Activate with `{"source":"compact"}` leaves the flag at `ultra`.
- [x] `tests/hooks.test.js:100` is updated to the agreed D2 behavior; the `normal mode` test at line 112 stays green unchanged.
- [x] `npm test` passes.
