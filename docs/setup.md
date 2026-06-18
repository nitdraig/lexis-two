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

### Phase A1 hosts (automated)

| Host | Project path | Global path |
| ---- | ------------ | ----------- |
| **Cursor** | `.cursor/rules/lexis-two.mdc` | `~/.cursor/rules/lexis-two.mdc` |
| **Windsurf** | `.windsurf/rules/lexis-two.md` | — |
| **Cline** | `.clinerules/lexis-two.md` | — |
| **Kiro** | `.kiro/steering/lexis-two.md` | — |
| **AGENTS.md** | `./AGENTS.md` | — |
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

### Installer flags

| Flag | Description |
| ---- | ----------- |
| `--host <id[,id]>` | `cursor`, `windsurf`, `cline`, `kiro`, `agents`, `opencode`, `copilot-repo`, `claude`, `copilot`, `gemini`, `pi` |
| `--scope <scope>` | `project` (default), `global`, `both` |
| `--project-dir <path>` | Target project (default: current directory) |
| `--dry-run` | Print planned file operations only |
| `--yes` | Skip confirmation |
| `--force` | Overwrite existing files (`AGENTS.md` requires this) |
| `--non-interactive` | No prompts; use with `--host` and `--yes` |

### Safety rules

- **`AGENTS.md` is never overwritten** unless you pass `--force`.
- Re-running the installer is **idempotent**: identical files are skipped.
- With `--force`, existing targets are backed up to `*.bak` before overwrite.

---

## OpenCode (plugin — automated in A2)

```bash
npx @draig/lexis-two install --host opencode --scope project --yes
```

This merges `opencode.json` (appends `@draig/lexis-two` to `plugin` without removing existing entries) and copies slash commands to `.opencode/commands/`.

**Plugin ≠ slash commands.** The npm plugin injects rules only. Commands are separate markdown files — install copies them, or OpenCode will not list `/lexis` in the picker.

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
cp node_modules/@draig/lexis-two/.opencode/commands/specxis*.md ~/.config/opencode/commands/
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
