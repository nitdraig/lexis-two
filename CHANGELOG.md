# Changelog

All notable changes to `@draig/lexis-two` are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

## [1.5.1] - 2026-11-05

### Added

- Installer: `install --json` prints a read-only report of detected and installed hosts; `status` shows the same as a table; the host prompt marks each detected host as `new` or `installed`.
- Installer: `status` and the interactive `install` print one line when a newer version is on npm (1.5 s limit, silent on failure, skipped without a TTY or with `CI`). Turn off with `--no-update-check` or `LEXIS_TWO_NO_UPDATE_CHECK=1`; `status --check` runs it on demand.

### Changed

- OpenCode plugin: local models (`ollama`, `lmstudio`, `llamacpp`, `localhost`, `127.0.0.1`) now get the compact per-level ruleset instead of nothing. `LEXIS_TWO_LOCAL_FULL=1` sends them the full skill. Detection matches whole id segments, so a cloud id that merely contains "local" no longer counts. The compact `lite` block now carries the "Never lazy about" line.
- The repository no longer carries its own `.cursor/skills/` copy; the installer still copies `skills/` into a project's `.cursor/skills/`, and `check-rule-copies.js` checks only the host rule files.
- Removed the unused root `CNAME`, `.nojekyll`, `bin/lexis-two.js`, `plans/` and `site/public/redesing/`.

## [1.5.0] - 2026-11-04

### Changed

- Specxis: `spec.md` now carries a real status (`draft`, `agreed`, `implementing`, `done`) written by `/specx`. `/specx implement` refuses an unapproved spec and records a base commit; `/specx review` and `/specx close` diff against it, so checkpoint commits no longer empty the review. Review findings are checkboxes and `/specx close` refuses open High or Critical findings (unverifiable criteria need a waiver line).
- Specxis tasks: the rule is now one concern per task, with its tests inside it (cap of 10 unchanged; no minimum).
- Specxis templates no longer fix a language (`TypeScript: strict`) and use current command names.
- `desx` is repositioned from "visual slop + design-system drift" to design quality (consistency with your system, hierarchy, accessibility, readability). Keeping output from looking generic is now `/slopx`. Wording only: `desx` behavior and its exit code are unchanged apart from the new quality rules above.

### Added

- `/slopx`: the anti-generic gate. It keeps a change from looking or reading like default AI output and always runs four passes: `code` (debug calls, markers, commented-out code, empty catches), `copy` (emojis, placeholder text, stock marketing words, invented data), `look` (side-stripe borders, gradient text, hard shadows, default palettes, bounce easing) and `quality` (the `desx` checks, run as a sub-skill). Stable rule ids and `--list-rules`; waivers (`slopx-disable`, `-line`, `-next-line`) and `.slopx.json` ignores that require a reason; `--json`, `--github`, `--quiet`, exit codes 0/1/2; a suggestion on every finding, with an optional `handoff` that names the [Impeccable](https://github.com/pbakaus/impeccable) command that applies that kind of fix (Impeccable is not required); an opt-in PostToolUse hook for Claude Code. Read-only: it writes no file. See `docs/slopx.md`.
- `desx` quality rules: missing `alt`, crushed letter spacing, gray text on color, tiny text, tight line height, justified text, all-caps body text and wide body tracking.
- Installer upgrades: installs are recorded in `.lexis-two/manifest.json` (global: `~/.config/lexis-two/manifest.json`). Re-running install after a package upgrade updates unedited files without `--force`, uninstall removes unedited files even after an upgrade, files the package stopped shipping are cleaned up, and edited files are always left alone and reported. A corrupt manifest or one pointing outside the project stops the run before writing.
- CI: `npm run lint` (syntax of every JS source file, one `node --check` per file), a Windows leg in the test matrix, a `site` build job, and least-privilege `permissions`. `package.json` gained `repository`, `homepage`, `bugs`, `author` and `engines` (`node >=22`), and now publishes `pi-extension/package.json`.

### Changed (internal)

- The `lexis-two` command now runs `scripts/install.js` directly; the `bin/lexis-two.js` shim is no longer published. Checked with a packed global install on Windows (cmd and POSIX shims).
- Removed dead code with no behavior change: the unreachable `@draig/lexis-two/...` fallback in the OpenCode plugin, the self-referencing devDependency (and its lockfile entry), `neverOverwriteWithoutForce`, two unreachable "identical" branches in the OpenCode config planner, `normalizePersistedMode` (use `normalizeMode`), unreachable `/lexis` parser cases in the pi extension, and dead constants in `desx-audit`. Install and uninstall planning for Cursor skills and OpenCode now share one function each.
- `node scripts/check-rule-copies.js --fix` rewrites drifted host rule copies and Cursor skill copies, keeping each host's frontmatter.

### Breaking

- The installer now fails when it has no TTY and no `--yes` and the plan would write files, as its help always promised. Before, it wrote anyway. Scripts and CI that relied on that need `--yes`. `--dry-run` and hint-only hosts are unaffected.

### Fixed

- Mode state: only `/lexis <lite|full|ultra|off>` writes the active level. Bare `/lexis`, `status`, `plan`, `help`, `audit`, `debt`, `security` and `review` leave it alone (`/lexis review` runs once and no longer sticks), on Claude Code, Codex, Copilot, OpenCode and pi. A mode change also hands the model that level's definition.
- Session resume and compaction keep the chosen level; startup and clear apply the default. The activate hook no longer waits on a stdin the host keeps open.
- `normal mode` and `stop lexis` switch Lexis off only when they are the whole prompt, not when a sentence mentions them.
- Copilot no longer receives the Claude statusline setup nudge. The statusline scripts honor `CLAUDE_CONFIG_DIR`, and the OpenCode plugin honors `OPENCODE_CONFIG_DIR`.
- pi: `/lexis` and `/lexis help` now resolve to an existing skill (`lexis-two-help` was missing), and `/lexis-two` no longer depends on the undocumented `pi.commands`.
- Installer: a second `--force` no longer overwrites the first backup (`.bak`, `.bak.1`, ...). Uninstalling one host keeps `stacks/` while another host needs it. `--scope global` writes nothing to the project, skips hosts without a global form with a visible line, and does not install `stacks/`. `stacks/_template.md` is no longer copied to user projects.
- `desx-audit`: `--json` and the new `--dry-run` no longer write the report; unknown flags, missing values, a missing `--cwd` and an `--out` outside `--cwd` now exit 2 without writing; `--fail-on P0` exits 1 on a P0 finding.
- `desx-audit --git` scans staged, unstaged and untracked UI files, works from a subdirectory and in a repo with no commits, never falls back to a full scan, and never marks the findings of unscanned files as resolved.
- `desx-audit` detectors: sibling cards are no longer reported as nested (tag depth is tracked); disabled buttons are not reported when a stylesheet styles `:disabled` or when `disabled={x}` is dynamic; contrast pairs the `color` and `background` of one rule and no longer reads selectors such as `a[href="#abc"]` as colors; `calc()`, hairlines and pill radii are ignored by the scale checks.
- `desx-audit` reports use a stable finding id instead of the line number, so editing lines above a finding no longer moves it to Resolved and re-adds it. The report is in English, lists coverage per category (including "no data"), and still reads 1.4.0 reports.
- `specxis-debt` no longer overwrites `.specxis/debt.md`: it rewrites only its managed block, keeps ticked entries when lines move, matches whole words, and survives broken symlinks.
- `specxis-init` is idempotent and no longer edits `.gitignore`. Both scripts can be imported without running and have tests.

## [1.4.0] - 2026-09-18

### Added

- Stack profiles: `stacks/node-ts.md` + `stacks/_template.md`; `AGENTS.md` core is now stack-agnostic and detects a profile per task.
- Installer copies `stacks/` to the project root (skips existing files unless `--force`); `package.json` `files` include `stacks/`.
- `lexis-two-security` and `lexis-two-audit` are profile-aware — they run the stack audit only when a profile defines one, otherwise generic checks.
- Landing: welcome banner for the stack-profile feature and a dedicated "agnostic by design" section (stack / host / agent).

### Changed

- Landing and `/guide` copy: problem-first hero, three-step loop, `/desx` as a design pass beside the loop. npm/README descriptions drop “lowest tokens” as the product promise.
- README stack section and `/lexis security` / `/lexis audit` site copy now describe profile-based detection.

## [1.3.3] - 2026-09-11

### Added

- Discovery: `/discx` (alias `/discovery`), `skills/discovery/`, init script, templates.
- Short aliases: `/specx` → Specxis, `/lexis` stays the intensity command.
- Specxis soft gate on `new`: suggest `/discx` when the feature is vague and `01-mvp.md` is missing; `sin discovery` bypasses.
- Discovery `06-post-mvp.md` plus scale cycle: `/discx <next-slug>` after the current Specxis ships.
- README, landing, and `/guide`: sequential `/discx` `/specx` `/lexis` plus `/desx` after UI; npm `files` include Discovery/Specxis/Desx docs.
- Command Code harness: [docs/commandcode.md](./docs/commandcode.md) (`/import` + manual copy).
- Public `/lexis` surface: intensity, `plan`, `review`, `audit`, `debt`, `security`, `help`. `plan` absorbs clarify/sources/compare/scenarios.
- Design audit: `/desx` (`audit` / `apply`), `design-auditor` role, `scripts/desx-audit.js` (no model), `DESIGN-AUDIT.md`.

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
