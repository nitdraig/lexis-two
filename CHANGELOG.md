# Changelog

All notable changes to `@draig/lexis-two` are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added

- Discovery: `/discx` (alias `/discovery`), `skills/discovery/`, init script, templates.
- Short aliases: `/specx` → Specxis, `/lexis` stays the intensity command.
- Specxis soft gate on `new`: suggest `/discx` when the feature is vague and `01-mvp.md` is missing; `sin discovery` bypasses.
- Discovery `06-post-mvp.md` plus scale cycle: `/discx <next-slug>` after the current Specxis ships.
- README, landing, and `/guide`: three pillars `/discx` `/specx` `/lexis`; npm `files` include Discovery/Specxis docs.
- Command Code harness: [docs/commandcode.md](./docs/commandcode.md) (`/import` + manual copy).
- Public `/lexis` surface: intensity, `plan`, `review`, `audit`, `debt`, `security`, `help`. `plan` absorbs clarify/sources/compare/scenarios.

### Changed

- pi `/lexis` old names (`doubt`, `discx`, …) warn and redirect to `/lexis plan` or Discovery; folded `lexis-two-*` slash adapters removed.
- OpenCode installer treats `@draig/lexis-two@x.y.z` as already configured (does not add a second unpinned plugin).

### Removed

- Slash adapters for `lexis-two-doubt-driven`, `incremental-impl`, `debug-triage`, `source-driven`, `predict`, and `scenario` (skills remain for `@skill`).

## [1.2.4] - 2026-09-09

### Added

- Site: `/guide` and `/es/guide` pages with detailed usage explanations for `/lexis` and `/specxis` commands, HowTo structured data, and per-page meta titles/descriptions.
- README: link to the command usage guide at `lexis-two.excelso.xyz/guide`.
- Integrity check: Cursor `skills/` copies and Copilot load-bearing phrases in `scripts/check-rule-copies.js`.

### Fixed

- OpenCode plugin: restore `command.execute.before` hook so `/lexis <lite|full|ultra|off>` persists the active mode. The hook now only writes the flag when the argument is a valid mode.
- Spanish localization: add missing accents across the guide and the shared language switcher.
- Release notes: correct `docs/releases/v1.2.2.md` title/version and add `docs/releases/v1.2.3.md`.
- Version drift: host plugin manifests and `package-lock.json` now match `package.json` (`1.2.4`).

### Changed

- README: mark v1.0 CI roadmap item as completed.
- README and `AGENTS.md`: ecosystem agent names are not part of this npm package.
- `/lexis help` docs point at command adapters, not a missing skill folder.
- `npm test` runs `scripts/check-rule-copies.js` first.

## [1.2.3] - 2026-06-27

### Changed

- Bumped version to `1.2.3` across `package.json`, `package-lock.json`, `opencode.json`, `gemini-extension.json`, `pi-extension/package.json`, and other host manifests so installed copies report the same version.

## [1.2.2] - 2026-06-21

### Added

- Cursor installer copies portable `skills/*/SKILL.md` into `.cursor/skills/` (project) or `~/.cursor/skills/` (global).

## [1.2.1] - 2026-06-21

### Fixed

- `bin/lexis-two.js` shim and `devDependency` `file:.` so `npx` works from the package repo on Windows.
- CI install tests: isolate `XDG_CONFIG_HOME` when mocking `HOME`.

## [1.2.0] - 2026-06-17

### Added

- Six workflow skills under `/lexis`: `doubt`, `incremental` (`inc`), `debug` (`triage`), `source` (`src`), `predict`, `scenario` — folders `skills/lexis-two-*`.
- OpenCode, Gemini CLI, pi, and legacy slash aliases wired for all six skills.

## [1.1.1] - 2026-06-18

### Fixed

- OpenCode slash commands: ship under `.opencode/commands/` (plural) — OpenCode does not load `.opencode/command/`.
- Installer global path on Windows: use `~/.config/opencode` (matches `opencode debug paths`), not `%APPDATA%\opencode`.
- npm `bin` field: drop `./` prefix so `lexis-two` CLI is not stripped on publish (npm 11).

### Changed

- OpenCode plugin persists mode for `/lexis` as well as `/lexis-two`.

## [1.1.0] - 2026-06-17

### Added

- `CONTRIBUTING.md` — adapter architecture, host/skill/command checklists, PR contract.
- `examples/` — nine before/after cases (Next.js, Express, FastAPI).
- `docs/strategy.md` execution plan; pillar A/B/C acceptance criteria.
- `.github/pull_request_template.md`.

### Changed

- Installer copies OpenCode commands to `.opencode/commands/`.
- `docs/setup.md` — plugin vs slash commands, global install paths.

## [1.0.9] - 2026-06-16

### Added

- `npx @draig/lexis-two install` — rules-only hosts, OpenCode merge, uninstall, marketplace hints.
- Unified `/lexis` command with subcommands (`review`, `audit`, `debt`, `plan`, `security`, `help`).
- Specxis SDD layer (`/specxis`, `skills/specxis/`, `docs/specxis.md`).
- npm package ships `scripts/`, `pi-extension/`, rule copies, `AGENTS.md`.

### Fixed

- `.npmignore` no longer excludes install scripts and pi extension from the tarball.
- Manifest version sync across Claude, Codex, Copilot, Gemini adapters.

## [1.0.2] - earlier

Foundation release: OpenCode plugin, portable skills, multi-host adapters (Cursor, Windsurf, Cline, Kiro, Gemini, pi).

[1.2.2]: https://github.com/nitdraig/lexis-two/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/nitdraig/lexis-two/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/nitdraig/lexis-two/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/nitdraig/lexis-two/compare/v1.0.2...v1.1.1
[1.1.0]: https://github.com/nitdraig/lexis-two/compare/v1.0.9...v1.1.0
[1.0.9]: https://github.com/nitdraig/lexis-two/compare/v1.0.2...v1.0.9
[1.0.2]: https://github.com/nitdraig/lexis-two/releases/tag/v1.0.2
