# 002 — Fix mode tracker default-mode behavior

## Context

`hooks/lexis-two-mode-tracker.js` writes the default mode to the flag file whenever `/lexis` or `/lexis-two` is invoked with a non-mode argument (e.g., `/lexis plan`, `/lexis help`). This is the same class of bug that was recently fixed in `.opencode/plugins/lexis-two.mjs` and can silently overwrite the active mode in Claude, Codex, and Copilot workflows.

## Goal

Only persist a mode when the user explicitly requests a valid mode switch. Keep the existing `/lexis review` -> `review` behavior that `tests/hooks.test.js` currently enforces.

## Approach

1. In `hooks/lexis-two-mode-tracker.js`, change the `/lexis` and `/lexis-two` branch:
   - Persist `lite/full/ultra/off` when the argument matches.
   - Persist `review` (and alias `r`) when the argument matches, to keep existing tests passing.
   - If the argument is empty, persist `getDefaultMode()` (for bare `/lexis` or `/lexis status`).
   - If the argument is anything else (`plan`, `audit`, `help`, `doubt`, etc.), set `mode = null` and skip writing the flag.
2. Add tests in `tests/hooks.test.js`:
   - `/lexis plan` does not overwrite a previously set `ultra` mode.
   - `/lexis help` does not overwrite mode.
   - Bare `/lexis` still defaults to `getDefaultMode()`.
3. Update `CONTRIBUTING.md` if it mentions mode persistence behavior.

## Acceptance criteria

- `npm test` passes, including new assertions.
- `/lexis plan` after `/lexis ultra` leaves the flag as `ultra`.
- `/lexis review` still writes `review`.
- Bare `/lexis` writes the default mode.

## Verification

```bash
npm test
```

## Risks

- Some host integrations may have relied on the old default-on-any-arg behavior; tests and the new assertions guard against regression.
