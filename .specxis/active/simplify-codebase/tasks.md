# Tasks: simplify-codebase

> Each task maps to one file or one concern. Do not start until agreed.

## Tasks

- [ ] task-001: `bin/lexis-two.js` - delete; point `bin` at `scripts/install.js`, which has a shebang and a `require.main` guard. Verify with a packed global install, since `require.main` must hold through the npm link (S1).
- [x] task-002: `.opencode/plugins/lexis-two.mjs:18-27` - remove the fallback that `exports` blocks (S2).
- [x] task-003: `package.json:53` - remove the self-dependency and update the lockfile (S3).
- [x] task-004: `install.js` - remove `neverOverwriteWithoutForce` (591-601), the unreachable `identical` branches (689, 741), and the unused `options` param (S4, S5).
- [x] task-005: `install.js` - merge duplicated install and uninstall planning and the repeated config-path computation (S6). Drop if it does not reduce lines.
- [x] task-006: `lexis-two-config.js` and `lexis-two-instructions.js` - remove `normalizePersistedMode`, reuse `normalizeConfigMode` in `getDefaultMode`, drop the double normalization and re-exports. Update callers (S7, S8).
- [ ] task-007: `.cursor/skills/` - delete; drop that section from `check-rule-copies.js` and update `CONTRIBUTING.md:51` (S10).
- [x] task-008: `scripts/check-rule-copies.js` - add `--fix` that rewrites drifted copies, keeping each host's frontmatter (S11).
- [x] task-009: `pi-extension/index.js` - cut unreachable `parseLexisCommand` cases and reduce `LEXIS_COMPAT_ROUTES` to a list. Update `helpers.test.js:18-24` (S13).
- [x] task-010: `desx-audit.js` - remove `.css.ts` and `.css.js` from `UI_EXT` and dot-prefixed names from `SKIP_DIRS` (S15).

## Implementation Notes
- task-006 must keep `normalizeMode`: fix-mode-state depends on it to exclude `review`.
- task-007 assumes the repo's `.cursor/skills` is unused at runtime: the installer reads from `skills/`. Contributors using Cursor on this repo lose local skills; confirm that is acceptable.
- task-008 adds a few lines while removing manual steps, so it is the accepted exception to the line-count rule. If it grows past about 15 lines, drop it.

- Results (done in one run, at the maintainer's request). Net lines: `install.js` 1458 to 1359 (about -100, task-004 and 005), config and instructions -15 (006), pi extension -24 (009), `desx-audit` -6 (010), OpenCode plugin -9 (002), `check-rule-copies.js` +6 (008, the accepted exception).
  - task-001 is partial: `package.json` `bin` now points at `scripts/install.js` and `bin/` left `files`, verified with a packed global install on Windows through both the `.cmd` and POSIX shims. The file `bin/lexis-two.js` is still on disk because `rm` is denied here; delete it with `git rm bin/lexis-two.js`. The POSIX symlink case (`require.main` through `npm link`) was not run on Linux or macOS.
  - task-007 NOT done, and it needs your decision: deleting `.cursor/skills/` makes Cursor users of this repo lose the local skills. The installer reads from `skills/`, so users of the package are unaffected. If you agree, run `git rm -r .cursor/skills`, then remove the skills section from `check-rule-copies.js` and the `.cursor/skills` mention in `CONTRIBUTING.md:51`. `--fix` already covers those copies while they exist.
  - task-003 removed the self-dependency; `npm install --package-lock-only` regenerates the lockfile with only the root entry. The untracked `node_modules/@draig/lexis-two` link on this machine is now stale and harmless.
  - Bug caught while doing this: in fix-mode-state task-007 the OpenCode plugin split arguments with `/s+/` instead of `/s+/`, so only the first token up to an "s" was read. Fixed, with a regression test.
  - Not done (MAY): `PLUGIN_HOSTS` as a single constant. Each task is meant to be its own checkpoint commit; none was committed.

## Lexis Tags Added
