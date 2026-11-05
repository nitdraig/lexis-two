# Spec: agent-aware-installer

> Status: done
>
> Scope: make the installer's existing host detection visible and scriptable. Add a read-only `--json` report and a `status` command, and show detected and installed state in the interactive prompt. No full-screen TUI.

## Design

- **One detector.** `detectHosts(ctx)` in `scripts/install.js` and each host's `detect(ctx)` stay the only detection code. No `install-detect.js`, no second host list; hosts come from `ALL_HOST_IDS`.
- **The guided prompt already exists.** With a TTY and no `--host`, the installer lists the detected hosts and asks `Install for [...]? (Y/n or comma list)`. This spec improves what that prompt shows; it does not replace it.
- **Installed state comes from the manifest.** `readManifest` already records which host wrote each file. A host is "installed" when its entries exist in the project or global manifest.
- **The version check is automatic, but narrow.** `status` and the interactive `install` ask the npm registry for the latest version once per run and print one line if a newer one exists. It never blocks, never fails a command, never writes a file and sends nothing about the user or the project (a plain GET of the public package metadata). It is skipped when it cannot be useful: no TTY, `CI` set, `--json`, `--dry-run`, or the opt-out below. `status --check` forces the check in those cases and reports "up to date" or the failure.
- **No new files outside the manifest, no cache, no new dependency, no new mode.**

## Requirements

### MUST

- [x] `scripts/install.js` exposes a pure `buildReport(ctx)` returning `{ environment, hosts }`:
  - `hosts`: one record per id in `ALL_HOST_IDS` with `id`, `label`, `kind` (`rules`, `plugin` or `hint`), `detected` (boolean from the host's own `detect`), `installed` (`project`, `global`, both or none, from the manifests) and `supportsGlobal`.
  - `environment`: `os`, `node` (version), and `localRuntimes` listing `ollama` / `lmstudio` only when `OLLAMA_HOST` / `LMSTUDIO_HOST` is set. No sockets and no probing of its own.
- [x] `install --json` prints that report as JSON on stdout and exits 0 without writing anything, without prompting and without needing `--yes`. Combined with `--uninstall` or `--host` it is an error (`--json` is a report, not a plan).
- [x] `status` (`lexis-two status [--scope project|global|both] [--project-dir <path>]`) prints one line per host that is detected or installed: id, detected yes/no, installed project/global/none. It reads the manifests only, never writes, and exits 0. A corrupt manifest gives the same error text as install and exit 1.
- [x] In a TTY, the host prompt shows each detected host with its state (`new`, `installed`) instead of a bare id list. The accepted answers (`Y`, `n`, comma list) are unchanged.
- [x] Existing flags and behavior (`--host`, `--scope`, `--yes`, `--force`, `--dry-run`, `--uninstall`, `--non-interactive`) are unchanged. Output of those paths is byte-identical except the prompt line above.
- [x] Detection and the report never write files, spawn nothing beyond what the existing host detectors already do (`where` or `which` for a few CLIs) and make no network call. Only the version check below touches the network.
- [x] `latestVersion({ timeoutMs, registryUrl })` in `scripts/install.js` does one HTTPS GET of `https://registry.npmjs.org/@draig%2Flexis-two/latest` with Node's `https`, a default timeout of 1500 ms, no redirects followed, and returns the `version` string or `null` on any failure (timeout, offline, bad JSON, non-2xx). It never throws. `registryUrl` is injectable so tests use a local server.
- [x] `isNewer(latest, current)` compares `major.minor.patch` numerically; a pre-release or malformed value is "not newer". It is the only version comparison in the installer.
- [x] Automatic check: `status` and the interactive `install` call `latestVersion` when none of the skip conditions holds. A newer version prints exactly one line after the normal output: `lexis-two <latest> is available (you have <current>). Run: npx @draig/lexis-two@latest install`. Nothing is printed when up to date or when the check fails. The command's exit code and output are otherwise unchanged.
- [x] Opt-out: `LEXIS_TWO_NO_UPDATE_CHECK=1` or the flag `--no-update-check` turns the automatic check off. Skip conditions: stdout is not a TTY, `CI` is set, `--json`, `--dry-run`, `--uninstall`.
- [x] `status --check` runs the check regardless of the skip conditions (except the opt-out) and prints one of: the update line, `lexis-two <current> is up to date`, or `could not check for updates` (exit code 0 in all three).

### SHOULD

- [x] `status` and `--json` share one formatter so the two views cannot disagree.
- [x] `docs/setup.md` documents `--json`, `status`, and the report fields; `README.md` mentions `status` in the install section.

### MAY

- [x] `--json` also lists, per detected host, the files an install would write (`dryRun` plan summary). Only if it reuses `buildPlan` with no extra code.

## Out of scope (dropped or moved)

- Full-screen TUI (welcome, radar, diagnose, propose screens, spinner, resize handling, raw mode): dropped. The `readline` prompt covers selection. Revisit only if the prompt proves insufficient in use.
- `scripts/install-detect.js`, `install-tui.js`, `install-render.js`: dropped.
- `detect-cache.json`: dropped. Detection is a handful of `fs.existsSync` calls. The version check has no cache either.
- Self-update: the installer only reports a newer version; it never installs it.
- A recommended `local` mode: dropped. `local` is not a mode; local models are handled by the OpenCode plugin (`isLocalModel`, spec `local-ai-first-class`).
- Command Code and Codex as installer hosts: not in `ALL_HOST_IDS` today. Adding a host is its own change.
- Git and Python probing, `uninstall --tui`, mouse, themes, a "most recently used host" heuristic.

## Constraints

- Node stdlib only; Windows, macOS and Linux.
- `--json` output is stable and documented: new fields may be added, existing ones are not renamed.
- No emojis in output.

## Acceptance Criteria

- [x] `tests/install-report.test.js` (new file; existing cases stay in `tests/install.test.js`): `buildReport` lists every id in `ALL_HOST_IDS` exactly once; `detected` matches `detectHosts`; `installed` is `project` after a project install and `none` after uninstall; `localRuntimes` appears only with the env var set.
- [x] `install --json` in a scratch project prints valid JSON with `hosts` and `environment`, leaves the directory unchanged, and exits 0 in a non-TTY without `--yes`. `--json --host cursor` exits non-zero.
- [x] `status` output matches the report and is read-only; a corrupt manifest fails with the install error text.
- [x] The prompt test (TTY simulated or the prompt function unit-tested) shows `new` / `installed`, and `Y`, `n` and a comma list still behave as before.
- [x] Version check, against a local `http`-served fake registry (the test passes `registryUrl`): `latestVersion` returns the version on 200, and `null` on 404, invalid JSON, a closed port and a server that never answers (timeout honored, test under 3 s). `isNewer` table: `1.5.1 > 1.5.0`, `1.10.0 > 1.9.0`, equal and older are false, `1.6.0-beta.1` and `abc` are false.
- [x] The automatic check prints the one-line notice when the fake registry has a newer version, prints nothing when equal or on failure, and is not attempted when `CI=1`, with `--json`, `--dry-run`, `--no-update-check` or `LEXIS_TWO_NO_UPDATE_CHECK=1` (the fake server records zero requests).
- [x] `status --check` prints the three outcomes and exits 0 each time. A run that fails the check still exits with the same code as without it.
- [x] All existing `install.test.js` cases pass unchanged.
- [x] `npm test` and `npm run lint` pass.

## Risks

- The automatic check adds up to 1.5 s of delay on a slow or filtered network, on every `status` and interactive `install`. The timeout is the bound; the opt-out is the escape, and it must be in `--help` and `docs/setup.md`. It also is a network call the user did not type: it reveals only that someone ran lexis-two from an IP (a normal registry request), and the docs must say so.
- A host may be detected but never installed by us (for example Claude Code present on the machine): the report shows `detected: true, installed: none`, which is correct and must not read as a failure.
- `installed` depends on the manifest, so files copied by hand before manifests existed show as not installed. Document it; do not guess from file contents.

## Waivers

- 2026-11-05 (user): closed without running the interactive prompt in a real terminal and without querying the real npm registry. The prompt labels, the report, `status` and the version check are covered by tests against a local fake registry.
