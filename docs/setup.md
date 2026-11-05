# Lexis-Two Setup Guide

> Automated installer (phase A1) + manual paths for plugin hosts.
> See [portability.md](./portability.md) for the full host matrix.

## Quick install (rules-only hosts)

From any project directory:

```bash
npx @draig/lexis-two install
```

Non-interactive example:

```bash
npx @draig/lexis-two install --host cursor,agents --scope project --yes
```

Preview without writing files:

```bash
npx @draig/lexis-two install --host cursor --scope project --dry-run --yes
```

### Developing inside the `lexis-two` repository

`npx` resolves the **local** `package.json` when you run commands from the repo root. On Windows that skips creating `node_modules/.bin/lexis-two.cmd`, so `npx @draig/lexis-two install` can fail with *"lexis-two" is not recognized*.

The `devDependency` `"@draig/lexis-two": "file:."` is a junction (or copy) back to the repo root so `npx @draig/lexis-two` uses this tree. Do not recurse into `node_modules/@draig/lexis-two` — it *is* the repo. Prefer `node scripts/install.js` for scripts.

From the repo root, use either:

```bash
npm install   # once — links the CLI via devDependency file:.
npx @draig/lexis-two install --yes
```

```bash
npm run lexis-two -- install --yes
# or
node scripts/install.js install --yes
```

In any **other** project directory, `npx @draig/lexis-two install` works without extra steps.

**Cursor skills:** the installer copies every `skills/*/SKILL.md` into `.cursor/skills/<name>/` (project) or `~/.cursor/skills/<name>/` (global). Reload the Cursor window after install — skills appear under **Settings → Rules → Agent Skills** (or invoke with `@lexis-two-review`, etc.).

### Phase A1 hosts (automated)

| Host | Project path | Global path |
| ---- | ------------ | ----------- |
| **Cursor** | `.cursor/rules/lexis-two.mdc` + `.cursor/skills/*` | `~/.cursor/rules/lexis-two.mdc` + `~/.cursor/skills/*` |
| **Windsurf** | `.windsurf/rules/lexis-two.md` | — |
| **Cline** | `.clinerules/lexis-two.md` | — |
| **Kiro** | `.kiro/steering/lexis-two.md` | — |
| **AGENTS.md** | `./AGENTS.md` + `./stacks/` | — |
| **OpenCode** | `opencode.json` + `.opencode/commands/` | `~/.config/opencode/commands/` (Windows: `%USERPROFILE%\.config\opencode\commands\`) |
| **Copilot (repo)** | `.github/copilot-instructions.md` | — |

### Hint-only hosts (A4)

These print setup steps instead of modifying marketplace manifests:

| Host | What you get |
| ---- | ------------ |
| `claude` | Claude Code plugin paths + docs link |
| `copilot` | Copilot IDE extension manifest path + docs link |
| `gemini` | `gemini extensions install .` from package dir |
| `pi` | `npm install -g @draig/lexis-two` guidance |

```bash
npx @draig/lexis-two install --host claude,gemini,copilot --yes
```

## Command Code (`cmd`)

Separate TUI — not an installer `--host`. Seed OpenCode/Cursor, then `/import` inside Command Code. Full guide: [commandcode.md](./commandcode.md).

```bash
npx @draig/lexis-two install --host agents,opencode,cursor --scope global --yes --force
```

In `cmd`: `/import opencode` then `/import cursor`, then `/reload`. Use `/lexis plan` — not Command Code’s built-in `/plan`.

### Installer flags

| Flag | Description |
| ---- | ----------- |
| `--host <id[,id]>` | `cursor`, `windsurf`, `cline`, `kiro`, `agents`, `opencode`, `copilot-repo`, `claude`, `copilot`, `gemini`, `pi` |
| `--scope <scope>` | `project` (default), `global`, `both` |
| `--project-dir <path>` | Target project (default: current directory) |
| `--dry-run` | Print planned file operations only |
| `--yes` | Skip confirmation. Required when there is no TTY (CI, pipes) and the plan writes files |
| `--force` | Overwrite existing files (`AGENTS.md` requires this) |
| `--non-interactive` | No prompts; use with `--host` and `--yes` |
| `--json` | Print a read-only JSON report (see below) and write nothing. Cannot be combined with `--host` or `--uninstall` |
| `--no-update-check` | Skip the automatic version check (also `LEXIS_TWO_NO_UPDATE_CHECK=1`) |

### Report, status and updates {#status}

`npx @draig/lexis-two install --json` prints which hosts it can see and which it already installed, without prompting and without writing. Fields:

- `environment`: `os`, `node`, and `localRuntimes` (`ollama` / `lmstudio`, listed only when `OLLAMA_HOST` / `LMSTUDIO_HOST` is set).
- `hosts[]`: `id`, `label`, `kind` (`rules`, `plugin` or `hint`), `detected`, `installed` (`project`, `global`, `both` or `none`) and `supportsGlobal`.

`installed` comes from the install manifest, so files copied by hand before manifests existed show as `none`. A detected host that was never installed through this tool is `detected: true, installed: none`, which is normal.

`npx @draig/lexis-two status [--scope project|global|both]` prints the same data as one line per host that is detected or installed. It is read-only.

**Update check.** `status` and an interactive `install` ask the public npm registry (`registry.npmjs.org`, one GET of the package metadata, no data about you or the project) whether a newer version exists, wait at most 1.5 seconds, and print one line if there is one. It never installs anything and never changes the exit code; if the network is down it stays silent. It is skipped without a terminal, when `CI` is set, and with `--json`, `--dry-run` or `--uninstall`. Turn it off with `--no-update-check` or `LEXIS_TWO_NO_UPDATE_CHECK=1`. `status --check` runs it on demand and always says whether you are up to date, newer is available, or it could not check. `LEXIS_TWO_REGISTRY_URL` points it at a mirror.

### Safety rules

- **`AGENTS.md` is never overwritten** unless you pass `--force`.
- `stacks/` files are copied beside `AGENTS.md` and are **skipped if they exist** unless you pass `--force` (same contract as `AGENTS.md`).
- On uninstall, only `stacks/` files identical to the package are removed; modified files are skipped.
- Re-running the installer is **idempotent**: identical files are skipped.
- With `--force`, existing targets are backed up before overwrite: `*.bak`, then `*.bak.1`, `*.bak.2`, and so on. An earlier backup is never overwritten, so your original content survives repeated runs.
- Uninstalling one host keeps `stacks/` while another installed rule host (or an OpenCode project install) still needs it. The plan shows a `skip stacks` line naming who uses it.
- `--scope global` writes nothing to the project, and does not install `stacks/` (global rules cannot load a project's `./stacks/`). Hosts that have no global form (Windsurf, Cline, Kiro, `agents`, `copilot-repo`) are skipped with a visible line. Run again with `--scope project` inside a project to get `stacks/`.
- Without a TTY and without `--yes`, an install or uninstall that would write files exits with an error and writes nothing. `--dry-run` always works, and plans that only print hints (Claude Code, Gemini, Copilot IDE, pi) need no `--yes`.
- **Upgrades.** The installer records what it wrote in `.lexis-two/manifest.json` (global installs: `~/.config/lexis-two/manifest.json`): each path and a hash of its content. Commit the project manifest so teammates share the state.
  - Re-running the installer after a package upgrade **updates** files you did not edit, without `--force` and without a backup. A file you edited is left alone and shown as `skip ... [edited]`.
  - `--uninstall` removes files whose content still matches the manifest, even if the package changed since. Edited files are left alone and shown as `[modified]`. No backup is made for files that match, since the package can reproduce them.
  - Files an earlier version installed that the new package no longer ships are removed on reinstall (when unedited) and shown as `remove ... [no longer shipped]`.
  - Line endings are ignored when comparing, so `core.autocrlf` does not count as an edit.
  - Installs from before manifests keep working with the old rules (compare to the package, back up first). The next install adds them to the manifest.
  - A manifest that is corrupt, or that lists a path outside the project (global: outside your home and OpenCode config directories), stops the run before anything is written.
- Files starting with `_` in `stacks/` (such as `_template.md`) are for contributors and are not copied to user projects.

---

## OpenCode (plugin — automated in A2) {#opencode}

```bash
npx @draig/lexis-two install --host opencode --scope project --yes
```

This merges `opencode.json` (appends `@draig/lexis-two` to `plugin` without removing existing entries) and copies slash commands to `.opencode/commands/`.

**Plugin ≠ slash commands.** The npm plugin injects rules only. Commands are separate markdown files — install copies them, or OpenCode will not list `/lexis` in the picker.

**Local models get a compact ruleset.** When the model id has a segment `ollama`, `lmstudio`, `llamacpp`, `localhost` or `127.0.0.1` (for example `ollama/llama3`), the plugin sends the short block for your level (under 1,500 characters: the decision ladder, the rules and "Never lazy about") instead of the full skill, so small contexts stay free. The level is still the one you set with `/lexis`. It logs `lexis-two sending the compact ruleset to local model <id>` once per model through OpenCode's log. On a local model with a large context, set `LEXIS_TWO_LOCAL_FULL=1` to send the full skill. Ids that only contain the letters "local" inside a longer word, and every cloud model, are unaffected.

For every project you use OpenCode in:

```bash
npx @draig/lexis-two install --host opencode --scope project --yes
```

Or install once globally (all projects):

```bash
npx @draig/lexis-two install --host opencode --scope global --yes
```

Manual alternative — add to `opencode.json`:

```json
{
  "plugin": ["@draig/lexis-two"]
}
```

Global slash commands (optional manual step):

```bash
mkdir -p ~/.config/opencode/commands
cp node_modules/@draig/lexis-two/.opencode/commands/lexis*.md ~/.config/opencode/commands/
cp node_modules/@draig/lexis-two/.opencode/commands/specx*.md ~/.config/opencode/commands/
cp node_modules/@draig/lexis-two/.opencode/commands/disc*.md ~/.config/opencode/commands/
cp node_modules/@draig/lexis-two/.opencode/commands/desx*.md ~/.config/opencode/commands/
cp node_modules/@draig/lexis-two/.opencode/commands/slopx*.md ~/.config/opencode/commands/
```

---

## Claude Code {#claude-code}

Marketplace / local plugin — hints only:

```bash
npx @draig/lexis-two install --host claude --yes
```

Manual entry points:

| File | Role |
| ---- | ---- |
| `.claude-plugin/plugin.json` | Plugin manifest |
| `hooks/hooks.json` | Session hooks |
| `commands/` | Slash commands (TOML) |
| `skills/` | Portable skills |

Clone the repo or install `@draig/lexis-two` from npm, then point Claude Code at the plugin folder.

---

## GitHub Copilot {#github-copilot}

### IDE extension (marketplace)

```bash
npx @draig/lexis-two install --host copilot --yes
```

Manifest: `.github/plugin/plugin.json` + `hooks/copilot-hooks.json`.

### Repo instructions (automated)

When the project already has a `.github/` folder:

```bash
npx @draig/lexis-two install --host copilot-repo --scope project --yes
```

Copies `.github/copilot-instructions.md` (skips if you customized the file).

---

## Gemini CLI {#gemini-cli}

```bash
npx @draig/lexis-two install --host gemini --yes
```

Then from the package directory:

```bash
cd node_modules/@draig/lexis-two   # or ~/lexis-two when cloned
gemini extensions install .
```

Uses `gemini-extension.json`, `AGENTS.md`, `commands/`, and `skills/`.

---

## pi {#pi}

```bash
npx @draig/lexis-two install --host pi --yes
npm install -g @draig/lexis-two
```

The package declares `"pi"` extensions and skills in `package.json`.

---

## Reply language {#language}

Lexis does not force a language: the agent replies in the language you write in. To pin one, set it in either place (the environment variable wins):

1. `LEXIS_TWO_LANGUAGE` env, for example `LEXIS_TWO_LANGUAGE=Spanish`
2. Config file `~/.config/lexis-two/config.json` (Windows: `%APPDATA%\lexis-two\config.json`, or `$XDG_CONFIG_HOME/lexis-two/config.json` if set) with `{ "language": "Spanish" }`

The value must be a plain language name: letters, spaces and hyphens, up to 40 characters. Anything else is ignored. Code, comments and JSDoc stay in English.

This applies to hosts that run the hooks, plugin or extension (Claude Code, Codex, Copilot, OpenCode, pi). Static rule hosts (Cursor, Windsurf, Cline, Kiro, `AGENTS.md`) load a fixed copy, so add one line to your own project rules instead, for example `Respond in Spanish.`

---

## Verify installation

1. **Cursor / Windsurf / Cline / Kiro** — open the project; the lexis-two rule should load automatically.
2. **AGENTS.md** — confirm your agent reads `./AGENTS.md` from the project root.
3. **OpenCode / pi** — type `/` and pick `lexis` (not `lexis status` as a single name). Examples: `/lexis status`, `/lexis review`, `/lexis ultra`.

---

## Uninstall

Remove Lexis-Two files that this installer placed (skips modified files):

```bash
npx @draig/lexis-two install --uninstall --host cursor,opencode --scope project --yes
```

Preview:

```bash
npx @draig/lexis-two install --uninstall --host cursor --dry-run --yes
```

Safety:

- Only removes files **identical** to the package copy (custom edits are skipped).
- Creates a `*.bak` backup before deleting or overwriting an existing file.

Manual fallback:

```bash
rm .cursor/rules/lexis-two.mdc
rm .windsurf/rules/lexis-two.md
rm .clinerules/lexis-two.md
rm .kiro/steering/lexis-two.md
# AGENTS.md — only if unchanged from the Lexis-Two template
```
