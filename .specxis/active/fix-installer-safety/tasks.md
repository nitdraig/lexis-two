# Tasks: fix-installer-safety

> Each task maps to one function, with its test. Do not start until agreed.

## Tasks

- [x] task-001: `backupPath` (`install.js:409`) - return the first free name: `.bak`, then `.bak.1`, and so on (B11).
- [x] task-002: `buildUninstallPlan` (`install.js:864`) - plan stack removal only when no other rule host's file remains (B13).
- [x] task-003: `shouldCopyStacks` call sites (`install.js:864, 900`) - skip stacks when scope is `global`; warn about profiles (B14).
- [x] task-004: `resolveScopes` callers - warn when a host gets no scopes, and do not count it toward stacks (B14).
- [x] task-005: `confirmPlan` (`install.js:1052`) - error without TTY and without `--yes`, unless `--dry-run` (B15). CHANGELOG entry.
- [x] task-006: `listStackFiles` - exclude `_`-prefixed files (M8a). `CONTRIBUTING.md:146` keeps working from the repo copy.
- [x] task-007: `docs/setup.md` - document backup naming and the global-scope limit.

## Implementation Notes
- Not every existing CLI test was checked for `--yes`; task-005 may require adding it to some of them in `tests/install.test.js`.

- Results (all 7 tasks done in one run, at the maintainer's request):
  - 8 tests added to `tests/install.test.js`: backup names, shared stacks/ across uninstalls (including a modified host and an OpenCode project install), global scope writes nothing and warns, unsupported scope plans nothing, no-TTY refusal (with --dry-run and hint-only hosts still fine), template stack file excluded. Every existing CLI test already passed `--yes`, so none needed changes.
  - Uninstall still writes a backup of the unmodified file it removes (existing behavior and test); with unique names these accumulate (`.bak`, `.bak.1`, ...) across install/uninstall cycles. Dropping that pointless backup is a separate change.
  - MAY not done: removing an empty `stacks/` folder after the last uninstall (the files go, the folder stays).

## Lexis Tags Added
