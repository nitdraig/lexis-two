# Proposal: agent-aware-installer

## Goal

Turn `npx @draig/lexis-two install` into an agent-aware, terminal-first installer that detects which coding agents the user already has, profiles the environment, and installs only the Lexis-Two adapters the user can actually run. All interaction happens through a single, differentiated TUI that can also fall back to a plain CLI for CI.

## Lazy Check

- Does this need to exist? Yes. Today the installer requires the user to know which host flag to pass (`--host cursor`, `--host opencode`, etc.). Most users do not know which agents they will use or which files to copy. The result is partial or broken installs.
- Could the requirement be met another way? A static matrix in the README helps, but it still pushes the decision to the user. Auto-detection removes that friction.
- Does stdlib, the framework, or an installed dep already cover it? No new runtime dependency. Node stdlib (`readline`, `process.stdin`, `fs`, `os`, `child_process`) covers the TUI, detection, and install logic.
- What is the absolute minimum? A TUI wizard that scans for hosts, proposes an install set, and runs the existing install functions with `--yes`. The visual layer is a thin wrapper over current logic.

## Discovery source

- Path: N/A (scoped feature, derived from installer review and the prior strategy discussion).

## Context

- Affected: `scripts/install.js`, `scripts/install-detect.js` (new), `scripts/install-tui.js` (new), `scripts/install-render.js` (new), `tests/install.test.js`, `docs/setup.md`, `README.md`, `package.json` (bin entry).
- Existing state:
  - `scripts/install.js` accepts `--host`, `--scope`, `--force`, `--yes`.
  - `fix-installer-safety` and `installer-upgrade` specs already added manifest-based install/uninstall.
  - Local model support will be introduced by `local-ai-first-class`.

## Out of Scope (YAGNI)

- A graphical desktop app or web UI.
- Installing the agents themselves (Cursor, OpenCode, etc.). Lexis-Two only installs its own adapters.
- Auto-update (installing a newer version by itself) or background update checks. Superseded in part: an automatic, foreground, one-line "newer version available" notice is in scope (see `spec.md`).
- Support for hosts that are not in the existing installer matrix.
- Complex windowing, mouse support, or true color; the TUI stays within a standard terminal.

## Decisions (replace the former open questions)

- No full-screen TUI: the installer already detects hosts and asks with a `readline` prompt. The gap is visibility, so this spec adds a read-only `--json` report, a `status` command, and installed state in the prompt.
- No second detector and no cache: `detectHosts` stays the single source, hosts come from `ALL_HOST_IDS`.
- No recommended `local` mode: local models are handled by the OpenCode plugin.
- Goal and context above describe the original, larger idea; `spec.md` is the agreed scope.
