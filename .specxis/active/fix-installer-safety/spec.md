# Spec: fix-installer-safety

> Status: done

## Requirements

### MUST (non-negotiable)
- [x] A backup never overwrites an existing backup.
- [x] Uninstalling a host keeps `stacks/` while another installed rule host still needs it.
- [x] `--scope global` writes nothing to the project directory.
- [x] A host that does not support the requested scope produces a visible warning, and installs nothing for that host.
- [x] (D3) Without a TTY, a plan that writes and has no `--yes` exits non-zero and writes nothing. `--dry-run` still works.

### SHOULD (strong preference, can deviate with // lexis: comment)
- [x] A global install warns that `./stacks/` profiles are unavailable to global rules.
- [x] Files prefixed with `_` in `stacks/` are not copied to user projects.

### MAY (optional, implement only if trivial)
- [ ] Remove empty `stacks/` after the last uninstall.

## Constraints
- Security: uninstall still removes only files identical to the package.
- Language: plain JS. No new dependencies.

## Acceptance Criteria
- [x] Two consecutive `--force` runs leave the user's original content in some backup file.
- [x] Install windsurf and cline, uninstall windsurf: `stacks/node-ts.md` remains.
- [x] `--host windsurf --scope global` creates nothing in the project and prints the warning.
- [x] `tests/install.test.js` covers each case and `npm test` passes.
