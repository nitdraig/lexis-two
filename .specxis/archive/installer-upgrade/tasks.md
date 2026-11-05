# Tasks: installer-upgrade

> Each task maps to one function, with its test. Do not start until agreed. Requires fix-installer-safety.

## Tasks

- [x] task-001: `readManifest` and `writeManifest` in `install.js` - hash helper, path validation, corrupt-file error.
- [x] task-002: `executePlan` - record written files in the manifest.
- [x] task-003: `planFileCopy` - update when the hash matches, skip and report when edited.
- [x] task-004: `planFileRemove` - decide from the manifest, fall back to package comparison without one.
- [x] task-005: `buildPlan` - plan removal of unedited orphans listed in the manifest but no longer in the package.
- [x] task-006: `docs/setup.md` - describe upgrade and uninstall behavior; update the "Safety" section of `printHelp`.

## Implementation Notes
- The manifest also answers fix-installer-safety task-002 more precisely (which hosts remain); keep the simple check until this lands, then replace it.
- The OpenCode config merge stays as is: it is not a copied file.

- Results (done in one run, at the maintainer's request):
  - 10 tests added to `tests/install.test.js`: manifest contents, upgrade update without `--force` or backup, edited file survives reinstall and uninstall, uninstall after an upgrade, CRLF is not an edit, orphan removal, `../` rejected (project and global), corrupt manifest changes nothing, legacy behavior without a manifest. An older package version is simulated by rewriting the installed file and its manifest hash, since the package under test is fixed.
  - The `stacks/` "who still uses it" check kept its simple form (file exists and is not leaving); replacing it with the manifest is possible but was not needed.
  - Not done (MAY): removing other empty directories after uninstall. Only the manifest folder is removed when empty.
  - `executePlan(actions)` without a context behaves as before and writes no manifest, so existing callers are unaffected; the CLI passes the context.

## Lexis Tags Added
