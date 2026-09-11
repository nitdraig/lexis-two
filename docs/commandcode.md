# Command Code — Lexis-Two harness

[Command Code](https://commandcode.ai/docs/quickstart) (`cmd`) is a separate TUI agent. It is **not** OpenCode: it does not load `.opencode/plugins/lexis-two.mjs`, so **intensity `lite|full|ultra` does not persist** unless you set `LEXIS_TWO_DEFAULT_MODE` (see [modes.md](./modes.md)). Rules, skills, and slash prompts still apply.

Official Command Code docs: [import](https://commandcode.ai/docs/import), [skills](https://commandcode.ai/docs/skills), [slash commands](https://commandcode.ai/docs/reference/slash-commands), [memory / AGENTS.md](https://commandcode.ai/docs/memory).

## Fastest path (`/import`)

Command Code can copy another agent's skills, commands, and memory. Seed a **source** first, then import.

1. Install Lexis-Two on a host Command Code already knows how to read:

```bash
# Project rules (AGENTS.md) — skip if the repo already has it
npx @draig/lexis-two install --host agents --scope project --yes

# OpenCode slash files (recommended if you already use OpenCode)
npx @draig/lexis-two install --host opencode --scope global --yes --force

# Cursor skills (SKILL.md folders)
npx @draig/lexis-two install --host cursor --scope global --yes
```

2. In a Command Code session (project root):

```text
/import opencode
/import cursor
```

Bare `/import` scans every detected source (Claude, Codex, Cursor, pi, OpenCode, Gemini). Additive and idempotent: existing Command Code files are **skipped**, not overwritten.

3. `/reload` (or restart `cmd`). Check `/skills` and type `/discx`.

| Source | What you typically get |
| ------ | ---------------------- |
| `/import opencode` | Custom commands from `~/.config/opencode/commands/` and project `.opencode/commands/` (`discx.md` → `/discx`, `lexis.md` → `/lexis`, `specx.md` → `/specx`, `desx.md` → `/desx`). Uses `$ARGUMENTS` — same as Command Code. |
| `/import cursor` | Skills from `.cursor/skills/` / `~/.cursor/skills/` |
| `/import claude` | Claude plugin skills + `commands/*.toml` if present |
| `/import gemini` | Gemini `commands/` + skills if the importer finds them |
| `/import pi` | pi skills/commands if installed globally |

The OpenCode **plugin** (`@draig/lexis-two` in `opencode.json`) is **not** a Command Code mod. Import does not install mode hooks.

## Manual copy (no `/import`)

From a clone or `node_modules/@draig/lexis-two`:

**Project (this repo only)**

```bash
# Rules — Command Code reads AGENTS.md at the repo root
npx @draig/lexis-two install --host agents --scope project --yes

# Skills
mkdir -p .commandcode/skills
# Windows PowerShell: New-Item -ItemType Directory -Force .commandcode/skills
cp -R node_modules/@draig/lexis-two/skills/. .commandcode/skills/

# Commands (markdown dispatchers)
mkdir -p .commandcode/commands
cp node_modules/@draig/lexis-two/.opencode/commands/lexis.md .commandcode/commands/
cp node_modules/@draig/lexis-two/.opencode/commands/discx.md .commandcode/commands/
cp node_modules/@draig/lexis-two/.opencode/commands/discovery.md .commandcode/commands/
cp node_modules/@draig/lexis-two/.opencode/commands/specx.md .commandcode/commands/
cp node_modules/@draig/lexis-two/.opencode/commands/specxis.md .commandcode/commands/
cp node_modules/@draig/lexis-two/.opencode/commands/desx.md .commandcode/commands/
cp node_modules/@draig/lexis-two/.opencode/commands/desx-audit.md .commandcode/commands/
cp node_modules/@draig/lexis-two/.opencode/commands/desx-apply.md .commandcode/commands/
```

**User (all projects)** — same files under `~/.commandcode/skills/` and `~/.commandcode/commands/` (Windows: `%USERPROFILE%\.commandcode\`). Optional user memory: `~/.commandcode/AGENTS.md`.

**Session-only skills** (no copy):

```bash
cmd --skill node_modules/@draig/lexis-two/skills
```

If that path is not picked up as a catalog, point `--skill` at one skill directory (the folder that contains `SKILL.md`). Repeat the flag. Debug: `cmd skills list --debug`.

Command Code also auto-discovers `.agents/skills/` and `~/.agents/skills/`. `.commandcode/skills/` wins on name conflicts.

## What to run

| You want | In Command Code |
| -------- | --------------- |
| Intensity rules every turn | Project `AGENTS.md` (installer `--host agents`) |
| Discovery | `/discx <slug>` (custom command) or `/skill:discovery` |
| Specxis | `/specx` / `/specxis` |
| Design audit | `/desx` / `/desx audit` / `/desx apply` (or `/skill:desx`, `/skill:desx-apply`) |
| Lexis quality loop | `/lexis plan`, `/lexis review`, `/lexis audit`, `/lexis debt`, `/lexis security`, `/lexis help` |
| Skill by folder name | `/lexis-two-plan`, `/discovery`, … or `/skill:<name>` if a built-in shadowed it |

Do **not** create `.commandcode/commands/plan.md` or `review.md`. Command Code already owns `/plan` (plan **mode**) and `/review` (PR review). Lexis stays under `/lexis …`.

`/help` and `/status` are Command Code built-ins. Lexis help/status are `/lexis help` and `/lexis status`.

## Limits (YAGNI)

- No Lexis-Two **mod** for Command Code yet — no persistent `/lexis ultra` flag file like OpenCode.
- `commands/*.toml` is Gemini/Claude; Command Code wants **markdown** commands (OpenCode `.md` files). Prefer those, or `/import claude` if you use Claude.
- Headless `cmd -p` does not take typed slash commands; use interactive mode for `/discx`.
- After copying files, `/reload` so discovery picks them up.

## Verify

1. `cmd skills list` — expect `discovery`, `specxis`, `desx`, `desx-apply`, `lexis-two-plan`, …
2. `/discx demo-slug` in a throwaway folder — should scaffold or ask B1–B8, no product code.
3. `/lexis help` — public verb card, not Command Code’s `/help`.
4. `/desx audit` — writes `DESIGN-AUDIT.md` only (detector needs no API key).
