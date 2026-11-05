# Tasks: local-ai-first-class

> Grouped by concern. Do not start until the spec is `agreed`. Each task ships with its tests.

## Tasks

- [x] task-001: Detection and compact instructions - `hooks/lexis-two-config.js` (`isLocalModel`, exported) and `hooks/lexis-two-instructions.js` (`getLexisInstructions(mode, { compact })` returning `LEVELS[mode]` plus the language line). Tests in `tests/hooks.test.js`: the `isLocalModel` table, the "Never lazy about" line in every level, the 1,500-character budget, and that the call without `compact` is unchanged.
- [x] task-002: Plugin routing - `.opencode/plugins/lexis-two.mjs`. Replace the inline `includes` check with `isLocalModel`, push the compact block instead of returning, log once per model. Update `tests/opencode-plugin.test.js:112` (it asserts the old skip) to the new behavior: local gets compact, cloud gets full, `off` gets nothing, one log per model. Add the `LEXIS_TWO_LOCAL_FULL=1` check (one condition) with a test that it sends the full skill and that other values do not.
- [x] task-003: Docs and changelog - `docs/setup.md` (replace the line-129 paragraph), `docs/portability.md`, `CHANGELOG.md` (Unreleased). Run `npm test` and `npm run lint` last.

## Implementation Notes

- Order: 001, then 002, then 003.
- `isLocalModel` matches whole segments, not substrings, so `localized` or `socalled` never match.
- `LEXIS_TWO_LOCAL_FULL` is in scope (task-002); document it in task-003.

## Lexis Tags Added

- None yet.
