# Spec: installer-upgrade

> Status: done

## Requirements

### MUST (non-negotiable)
- [x] Install records each written path and its content hash.
- [x] Reinstall updates a file whose hash matches the manifest, without `--force`.
- [x] Reinstall leaves a user-edited file alone and reports it.
- [x] Uninstall removes files whose hash matches the manifest, even after a package upgrade.
- [x] Uninstall leaves user-edited files and reports them.
- [x] Reinstall removes unedited files the new package no longer ships.
- [x] Without a manifest, behavior is what it is today (old installs keep working).

### SHOULD (strong preference, can deviate with // lexis: comment)
- [x] Hashes ignore line-ending differences, so `core.autocrlf` does not read as a user edit.
- [x] Removing a file the tool owns creates no `.bak`; the content is reproducible from the package.

### MAY (optional, implement only if trivial)
- [ ] Remove directories left empty by uninstall.

## Constraints
- Security: reject manifest paths that resolve outside the target directory; the manifest may be tampered with.
- Data safety: a corrupt manifest stops with a clear error and changes nothing.
- Language: plain JS. No new dependencies.

## Acceptance Criteria
- [x] Simulated upgrade: install, change package content, reinstall: file updated, no `--force`.
- [x] Same setup, uninstall: file removed.
- [x] Edited file survives both.
- [x] A manifest entry with `../` is rejected.
- [x] `npm test` passes.
