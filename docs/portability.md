# Agent Portability

Lexis-Two is an agent-portable ecosystem. The `skills/` folder holds the core behavior.
Host-specific files are thin adapters that point to those skills.

**Site (live target):** [lexis-two.excelso.xyz](https://lexis-two.excelso.xyz) — static landing in `docs/`. See [site.md](./site.md) for hosting.

## Naming

| Name | What it is |
| ---- | ---------- |
| `lexis` | Base prefix — `// lexis:` comments, shared philosophy |
| `lexis-two` | This repo — public portable rules, skills, commands, adapters |
| `lexis-one` | Private agent configuration (not published) |
| `lexis-zero` | Future orchestrator-style agent (not shipped yet) |

Slash commands and skill folders use the `lexis-two-*` prefix. Plugin manifests use `"name": "lexis-two"`.

## Supported Hosts

| Host | Files | Level |
| ---- | ----- | ----- |
| OpenCode | `.opencode/plugins/lexis-two.mjs`, `.opencode/command/`, `hooks/`, `skills/` | Full — plugin + mode switches + commands |
| Claude Code | `.claude-plugin/`, `hooks/hooks.json`, `commands/`, `skills/` | **Coming soon** (v0.3) — files in repo, not verified |
| GitHub Copilot (IDE plugin) | `.github/plugin/plugin.json`, `hooks/copilot-hooks.json`, `commands/`, `skills/` | **Coming soon** (v0.3) — files in repo, not verified |
| Gemini CLI | `gemini-extension.json`, `AGENTS.md`, `commands/`, `skills/` | Full — extension manifest + commands |
| pi | `pi-extension/`, `skills/` (via `package.json` `"pi"`) | Full — extension + commands |
| Codex | `.codex-plugin/plugin.json`, `hooks/hooks.json`, `AGENTS.md` | Full — plugin + hooks |
| Cursor | `.cursor/rules/lexis-two.mdc` | Rules — always-on project rule |
| Windsurf | `.windsurf/rules/lexis-two.md` | Rules — project rule |
| Cline | `.clinerules/lexis-two.md` | Rules — project rule |
| GitHub Copilot (repo) | `.github/copilot-instructions.md` | Rules — repository instruction |
| GitHub Copilot CLI | `AGENTS.md` or `~/.copilot/copilot-instructions.md` | Rules — no mode switches |
| Kiro | `.kiro/steering/lexis-two.md` | Rules — steering rule |
| VS Code + Codex | `AGENTS.md` or `~/.codex/AGENTS.md` | Rules — instruction tier |
| Antigravity | `AGENTS.md` or `.agents/rules/` | Rules — instruction tier |
| Generic agents | `AGENTS.md` or `skills/*/SKILL.md` | Rules — copy and load |

### Adapter rule

Keep adapters thin. When a host supports skills or hooks, point it at the
existing `skills/` and `hooks/` files. When a host only supports project
instructions, keep its rule text aligned with `AGENTS.md`.

Run `node scripts/check-rule-copies.js` after editing `AGENTS.md` to verify
instruction-tier copies (Cursor, Windsurf, Cline, Kiro) have not drifted.

## Slash Commands

Available on hosts that ship `commands/` and/or `.opencode/command/` today: OpenCode, Gemini CLI, pi. Claude Code and Copilot plugin: v0.3.

| Command | Skill / behavior |
| ------- | ---------------- |
| `/lexis-two` | Mode switch — `lite`, `full` (default), `ultra`, `off` |
| `/lexis-two-review` | `skills/lexis-two-review/` — diff review for over-engineering |
| `/lexis-two-audit` | `skills/lexis-two-audit/` — full repo audit |
| `/lexis-two-debt` | `skills/lexis-two-debt/` — harvest `// lexis:` comments |
| `/lexis-two-plan` | `skills/lexis-two-plan/` — plan before coding |
| `/lexis-two-security` | `skills/lexis-two-security/` — security audit (Node/TS stack default) |
| `/lexis-two-help` | Quick reference card |

Gemini CLI: `commands/lexis-two*.toml`. OpenCode: `.opencode/command/lexis-two*.md`.

## Portable Skills

| Skill | What it does |
| ----- | ------------ |
| `skills/lexis-two/` | Core ruleset + intensity levels |
| `skills/lexis-two-review/` | Diff review for over-engineering |
| `skills/lexis-two-audit/` | Full repo audit |
| `skills/lexis-two-debt/` | Harvest `// lexis:` comments into debt ledger |
| `skills/lexis-two-plan/` | Feature planning before coding |
| `skills/lexis-two-security/` | Security audit (default: Node.js / Next.js / MongoDB) |

Adapt skill shell commands for other stacks — see README **Adapting Lexis-Two to Any Stack**.

## Project Install

```bash
git clone https://github.com/nitdraig/lexis-two.git ~/lexis-two
```

### OpenCode

Add to `opencode.json` in the project (or `~/.config/opencode/opencode.json` globally):

```jsonc
{
  "plugin": ["~/lexis-two/.opencode/plugins/lexis-two.mjs"],
  "instructions": ["~/lexis-two/AGENTS.md"]
}
```

### Cursor

```bash
cp ~/lexis-two/.cursor/rules/lexis-two.mdc .cursor/rules/lexis-two.mdc
```

### Windsurf / Cline / Kiro

Copy the matching rule file into your project:

```bash
cp ~/lexis-two/.windsurf/rules/lexis-two.md .windsurf/rules/
cp ~/lexis-two/.clinerules/lexis-two.md .clinerules/
cp ~/lexis-two/.kiro/steering/lexis-two.md .kiro/steering/
```

### Gemini CLI

Run from the cloned repo root (manifest auto-discovers `commands/` and `AGENTS.md`):

```bash
cd ~/lexis-two
# Follow Gemini CLI extension install for gemini-extension.json
```

### pi

Install as a pi package from the repo root (`package.json` declares `"pi"` extensions and skills).

## Global Install (rules-only hosts)

```bash
# Cursor (global)
cp ~/lexis-two/.cursor/rules/lexis-two.mdc ~/.cursor/rules/lexis-two.mdc

# GitHub Copilot CLI (global)
cp ~/lexis-two/AGENTS.md ~/.copilot/copilot-instructions.md

# VS Code + Codex (global)
cp ~/lexis-two/AGENTS.md ~/.codex/AGENTS.md

# OpenCode (global) — add to ~/.config/opencode/opencode.json:
# { "plugin": ["~/lexis-two/.opencode/plugins/lexis-two.mjs"] }
```

## Config

Default mode resolution (hooks + pi + OpenCode plugin):

1. `LEXIS_TWO_DEFAULT_MODE` env var (`off` \| `lite` \| `full` \| `ultra`)
2. Config file: `~/.config/lexis-two/config.json` (Windows: `%APPDATA%\lexis-two\config.json`) with `{ "defaultMode": "full" }`
3. Fallback: `full`

Active mode flag (Claude Code): `~/.claude/.lexis-two-active`. OpenCode: `~/.config/opencode/.lexis-two-active`.
