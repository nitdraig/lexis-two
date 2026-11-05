# Proposal: installer-upgrade

## Goal
Users can update and fully uninstall Lexis-Two after a package upgrade without manual cleanup.

## Lazy Check
- Does this need to exist? Yes, if the package keeps shipping updates. Today reinstall says `[exists]` and uninstall says `[modified]`, so the installed version is stuck.
- Could the requirement be met another way? `--force` updates but overwrites user edits blindly, leaves backups and cannot remove orphans. Not enough.
- Does stdlib, the framework, or an installed dep already cover it? `crypto.createHash` and JSON cover it.
- What is the absolute minimum? One manifest listing each installed path and its hash. Unchanged hash means ours to update or remove; changed hash means the user's, leave it.

## Discovery source
- Path: N/A (clearly scoped)

## Context
- Affected: `scripts/install.js`, `tests/install.test.js`, `docs/setup.md`.
- Finding: M1 in [improvement-plan.md](../../improvement-plan.md). Requires fix-installer-safety merged.

## Out of Scope (YAGNI)
- Three-way merges of edited files.
- Automatic update checks or a separate `update` command: re-running install is the update.
- Migrating old installs beyond the fallback below.

## Open Questions
- Manifest location. Proposed: `.lexis-two/manifest.json` in the project, and the Lexis config dir for global scope.
- Should the manifest be committed? Proposed: yes, so teammates share the same state.
