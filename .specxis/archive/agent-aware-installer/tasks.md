# Tasks: agent-aware-installer

> Grouped by concern. Do not start until the spec is `agreed`. Each task ships with its tests (new ones in `tests/install-report.test.js`).

## Tasks

- [x] task-001: Report and `--json` - `scripts/install.js`. Add `buildReport(ctx)` (hosts from `ALL_HOST_IDS`, `detected` from each host's `detect`, `installed` from `readManifest` for both scopes, environment with `os`, `node` and env-var-only `localRuntimes`) and one shared formatter. Wire `install --json` (read-only, no prompt, no `--yes`, error with `--host` or `--uninstall`). Export `buildReport`. Tests: one record per id, detected matches `detectHosts`, installed state across install and uninstall, `localRuntimes` only with env, scratch directory unchanged, non-TTY exit 0.
- [x] task-002: `status` command - `scripts/install.js`. Parse `status` with `--scope` and `--project-dir`, print one line per detected or installed host from the shared formatter, read-only, corrupt manifest fails with the install error text and exit 1. Add it to `--help`. Tests: output equals the report view, read-only, corrupt manifest.
- [x] task-003: Version check - `scripts/install.js`. Add `latestVersion({ timeoutMs, registryUrl })` and `isNewer`, the automatic one-line notice after `status` and interactive `install` with the skip conditions, `--no-update-check`, `LEXIS_TWO_NO_UPDATE_CHECK=1`, and `status --check`. Add the flags to `--help`. Tests against a local fake registry as listed in the acceptance criteria (newer, equal, 404, bad JSON, closed port, never-answering server, zero requests when skipped).
- [x] task-004: Prompt state and docs - `resolveHosts` in `scripts/install.js` prints `id (new)` / `id (installed)` in the prompt; answers unchanged. Update `docs/setup.md` (`--json` fields, `status`, the manifest caveat, the update check: what it requests, when it is skipped, how to turn it off), `README.md` (install section) and `CHANGELOG.md`. Tests: the three accepted answers still work and the prompt shows the state. Run `npm test` and `npm run lint` last.

## Implementation Notes

- Order: 001, then 002 (reuses the formatter), then 003 (needs `status`), then 004.
- The version comes from `package.json` (`require('../package.json').version`); do not read it from the manifest.
- Keep everything in `scripts/install.js` unless it grows past what reads well; if the report code needs its own file, `scripts/install-report.js` is enough, with no other new modules.
- The prompt is already `readline`-based (`question`); do not add raw mode.
- `--json` must not change the exit path of any existing flag combination: parse it as a mode, like `--help`.

## Lexis Tags Added

- None yet.
