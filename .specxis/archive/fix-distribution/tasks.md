# Tasks: fix-distribution

> Each task maps to one file or one mechanical change. Do not start until agreed.

## Tasks

- [x] task-001: `tests/opencode-postinstall.test.js` - run the script with `spawnSync` instead of `import()` so `process.exit` cannot end the runner. Confirm it fails on current code.
- [x] task-002: `scripts/opencode-wrapper-postinstall.mjs:44` - resolve `../../..` to reach the wrapper. task-001 turns green.
- [x] task-003: `.claude-plugin/plugin.json` - prefix paths with `./`. If validation or a real load reports duplicate hooks, drop the `hooks` field and rely on automatic loading.
- [x] task-004: `.claude-plugin/marketplace.json` - remove `suggestions`.
- [x] task-005: `skills/lexis-two-debt/SKILL.md` - quote the description, scan from the repo root instead of `src`. Sync the `.cursor/skills` copy (the integrity check requires it).
- [x] task-006: `AGENTS.md` - remove the Spanish rule (D1), replace links to uninstalled files with repo URLs. Sync the four rule copies.
- [x] task-007: Sweep both "Respond in Spanish" and "Chat: Spanish" from 24 files in `skills/` and `.opencode/commands/`, plus `.github/copilot-instructions.md:34`: respond in the user's language unless the project's rules set one. Sync `.cursor/skills`. Update `CONTRIBUTING.md:7`.
- [x] task-008: `package.json` `files` - add `gemini-extension.json`, `.claude-plugin/`, `.github/plugin/`.
- [x] task-009: `tests/install.test.js` - new test: every package path shown in hints appears in `npm pack --dry-run --json`.
- [x] task-010: `hooks/lexis-two-config.js` and `getLexisInstructions` - add validated `getLanguage()`, append the instruction when set, keep other keys in `writeDefaultMode`. Tests in `tests/hooks.test.js`; document in `docs/setup.md` (D1).

## Implementation Notes
- The false green: the script calls `process.exit(0)` inside the test process, which exits with success before any assert runs.
- task-001 must go first, to prove the test can fail.
- Manifests in `files` is the smaller option compared with rewriting hints as clone-only.

## Lexis Tags Added
