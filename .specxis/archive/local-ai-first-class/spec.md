# Spec: local-ai-first-class

> Status: done
>
> Scope: stop skipping local models in the OpenCode plugin. Send them the compact per-level block that `hooks/lexis-two-instructions.js` already carries, instead of nothing and instead of the full skill.

## Design

- **No new mode.** `local` is not a level. The level stays `lite|full|ultra|off`, chosen by `/lexis`; only `RUNTIME_MODES` can be persisted. Whether the model is local only decides how much text is sent.
- **No new skill file.** `LEVELS` in `hooks/lexis-two-instructions.js` already holds a compact block per level (decision ladder, rules, "Never lazy about"). It is today only a fallback when `SKILL.md` cannot be read. Local models get that block. One source of truth, no drift.
- **Detection is a function.** `isLocalModel(id)` is exported from `hooks/lexis-two-config.js` and unit tested. The plugin calls it.

## Requirements

### MUST

- [x] `getLexisInstructions(mode, { compact: true })` returns the `LEVELS[mode]` block plus the configured language line. Without `compact` the output is byte-identical to today's.
- [x] `isLocalModel(id)` returns true for ids that name a local runtime or loopback host: `ollama`, `lmstudio`, `llamacpp`, `localhost`, `127.0.0.1`, as a whole segment of the id (split on `/`, `:`, `@`). It returns false for `anthropic/claude-...`, `openai/gpt-...` and any id that merely contains the letters `local` inside a longer word. Non-string input is false.
- [x] `.opencode/plugins/lexis-two.mjs` no longer returns early for a local model: it pushes `getLexisInstructions(mode, { compact: true })`. `off` still pushes nothing.
- [x] The plugin logs once per local model that it is sending the compact ruleset (replacing the "not injected" message).
- [x] The compact block for every level keeps the "Never lazy about" line (validation, error handling, security, accessibility, types). A test fails if one is missing.
- [x] Each compact block stays under 1,500 characters, checked by a test. This is the token budget.
- [x] `LEXIS_TWO_LOCAL_FULL=1` makes the plugin send the full filtered skill to a local model too (for a large context). Any other value, or unset, keeps the compact block.
- [x] Cloud models still receive the full filtered skill. Existing tests for that pass unchanged.

### SHOULD

- [x] `docs/setup.md`: replace the "Local models are skipped" paragraph (line 129) with what is sent now, how to get the full skill on a large local model, and the character budget.
- [x] `docs/portability.md` mentions the compact block for local models where it describes the OpenCode plugin.
- [x] One `CHANGELOG` line under the next release: local models now get the compact ruleset.


## Out of scope (moved or dropped)

- `SKILL.local.md`: dropped. `LEVELS` already is the compact text.
- `scripts/lexis-local-cli.js` and the benchmark `--check-rules`: not part of this spec. If wanted, a separate spec. Rule adherence of generated code overlaps `/slopx` (`code/*`) and should reuse it, not add a second regex checker.
- Per-host copies of a local skill (Cursor, Claude, Gemini): those hosts have no model-id signal, so there is nothing to switch on.
- Auto-detecting the context window from the model name.

## Constraints

- No new dependency, no new mode, no new file under `skills/`.
- `normalizeMode`, `getDefaultMode` and the mode flag file are unchanged.
- The language line behaves as for every other mode.

## Acceptance Criteria

- [x] `tests/opencode-plugin.test.js`: an `ollama/llama3` request receives the compact block (contains "Never lazy about", does not contain text that only the full skill has); an `anthropic/claude-x` request receives the full text; `off` pushes nothing; the log line appears once per local model.
- [x] `tests/hooks.test.js`: `isLocalModel` table (positive and negative cases, including `anthropic/localized-x`), the "Never lazy about" check and the size budget for each level.
- [x] `npm test` and `npm run lint` pass.
- [x] `docs/setup.md` no longer says local models are skipped.

## Risks

- A 7B model may still ignore the compact block. Out of scope here; measuring it needs a live model, not CI.
- `LEVELS` is now load-bearing, not just a fallback. The budget and safety-line tests are what keep it that way.

## Waivers

- 2026-11-04 (user): closed without testing against a live Ollama or LM Studio session. Local-model routing is covered by unit and plugin tests only.
