# Changelog

All notable changes to `@draig/lexis-two` are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/).

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

[1.1.1]: https://github.com/nitdraig/lexis-two/compare/v1.0.2...v1.1.1
[1.1.0]: https://github.com/nitdraig/lexis-two/compare/v1.0.9...v1.1.0
[1.0.9]: https://github.com/nitdraig/lexis-two/compare/v1.0.2...v1.0.9
[1.0.2]: https://github.com/nitdraig/lexis-two/releases/tag/v1.0.2
