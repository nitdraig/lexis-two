# Tasks: ci-and-housekeeping

> Each task maps to one file or one concern. Do not start until agreed.

## Tasks

- [x] task-001: `scripts/check-syntax.js` + `package.json` `lint` - walk source directories, run `node --check` per file, fail on any error (M2).
- [x] task-002: `.github/workflows/test.yml` - OS matrix, lint step, separate `site` job, `permissions: contents: read`, plugin validation, drop the duplicate rule check (M2, S16).
- [x] task-003: `package.json` - add metadata and `engines` (`>=22`, matching CI); add `pi-extension/package.json` to `files` (M5).
- [x] task-004: `.opencode/plugins/lexis-two.mjs:87` and `docs/setup.md` - log the local-model skip and document it (M6).
- [x] task-005: Delete `site/public/redesing/` after confirming no page links to it (M8b).
- [x] task-006: Moved to [fix-specx](../fix-specx/tasks.md) (`specxis-init`, templates, stale command names: M3b, M8b). Nothing to do here.
- [x] task-007: Delete `plans/` (approved; blocked by a permission rule, the maintainer runs it). 001, 002 and 004 are covered by specs; 003 and 005 remain in the README roadmap (M4).

## Implementation Notes
- The Windows job must not assume a POSIX shell: `npm test` uses a `tests/*.test.js` glob that Node resolves itself on recent versions.
- `pi-extension/package.json` is `private`, which is harmless once nested; it only supplies `type: module`.

- Results (done in one run, at the maintainer's request):
  - Done: `npm run lint` (46 files; `examples/` excluded because its `.js` files hold TypeScript), `test.yml` (ubuntu + windows matrix, `fail-fast: false`, lint step, separate `site` job, `permissions: contents: read`, duplicate rule check dropped), package metadata and `engines`, `pi-extension/package.json` published, OpenCode local-model skip logged once per model and documented. `npm audit` reports 0 vulnerabilities; the site builds.
  - NOT verified: the workflow has never run. The Windows leg may need fixes (shell, symlinks, paths) once it runs on GitHub.
  - Left out on purpose: `claude plugin validate` in CI. Whether the CLI validates without authentication on a runner is unknown, so it stays a documented local check.
  - BLOCKED, needs the maintainer: task-005 and task-007 (deletions). `rm` is denied by a permission rule here, and `git rm` stopped at a stale-looking `.git/index.lock` (empty, over 25 minutes old, no git process running) that I did not remove. No page links to `site/public/redesing/` (checked in `site/src`, `README.md`, `docs/`; only my stale `docs/DESIGN-AUDIT.md` mentions it). Run, after making sure no git process is open: `rm .git/index.lock` then `git rm -r site/public/redesing plans docs/DESIGN-AUDIT.md`.
  - Not done (MAY): root `CNAME` and `.nojekyll`; the Pages deploy was not checked against them.

## Lexis Tags Added
