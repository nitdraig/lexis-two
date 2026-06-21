# Agent Portability

Lexis-Two is an agent-portable ecosystem. The `skills/` folder holds the core behavior.
Host-specific files are thin adapters that point to those skills.

**Site (live target):** [lexis-two.excelso.xyz](https://lexis-two.excelso.xyz) — built from `site/` and deployed via GitHub Actions. See [site.md](./site.md) for hosting.

## Naming

| Name | What it is |
| ---- | ---------- |
| `lexis` | Base prefix — `// lexis:` comments, shared philosophy |
| `lexis-two` | This repo — public portable rules, skills, commands, adapters |
| `lexis-one` | Private agent configuration (not published) |
| `lexis-zero` | Future orchestrator-style agent (not shipped yet) |

Slash commands: **`/lexis`** is canonical (subcommands below). Skill folders and adapter files keep the `lexis-two-*` prefix for package identity. Legacy `/lexis-two-*` commands remain as deprecated aliases.

## Supported Hosts

| Host | Files | Level |
| ---- | ----- | ----- |
| OpenCode | `.opencode/plugins/lexis-two.mjs`, `.opencode/commands/`, `hooks/`, `skills/` | Full — plugin + mode switches + commands |
| Claude Code | `.claude-plugin/`, `hooks/hooks.json`, `commands/`, `skills/` | Full — plugin + mode switches + commands |
| GitHub Copilot (IDE plugin) | `.github/plugin/plugin.json`, `hooks/copilot-hooks.json`, `commands/`, `skills/` | Full — plugin + mode switches + commands |
| Gemini CLI | `gemini-extension.json`, `AGENTS.md`, `commands/`, `skills/` | Full — extension manifest + commands |
| pi | `pi-extension/`, `skills/` (via `package.json` `"pi"`) | Full — extension + commands |
| Codex | `.codex-plugin/plugin.json`, `hooks/hooks.json`, `AGENTS.md` | Full — plugin + hooks |
| Cursor | `.cursor/rules/lexis-two.mdc`, `.cursor/skills/*` | Rules + Agent Skills (installer copies `skills/`) |
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

**Contributing:** See [CONTRIBUTING.md](../CONTRIBUTING.md) for how to add a host, skill, or command without duplicating logic.

Run `node scripts/check-rule-copies.js` after editing `AGENTS.md` to verify
instruction-tier copies (Cursor, Windsurf, Cline, Kiro) have not drifted.

## Slash Commands

Available on hosts that ship `commands/` and/or `.opencode/commands/` today: OpenCode, Gemini CLI, pi, Claude Code, and GitHub Copilot.

**Install reminder:** the npm **plugin** injects rules only. Slash commands need `.opencode/commands/*.md` (project) or `~/.config/opencode/commands/` (global). Run:

```bash
npx @draig/lexis-two install --host opencode --scope project --yes
```

### Canonical (`/lexis`)

| Command | Skill folder | Behavior |
| ------- | ------------ | -------- |
| `/lexis` or `/lexis status` | — | Report active + default mode |
| `/lexis lite` \| `full` \| `ultra` \| `off` | `skills/lexis-two/` | Switch ruleset intensity |
| `/lexis plan` (or `p`) | `skills/lexis-two-plan/` | Plan before coding |
| `/lexis review` (or `r`) | `skills/lexis-two-review/` | Diff review for over-engineering |
| `/lexis audit` (or `a`) | `skills/lexis-two-audit/` | Full repo audit |
| `/lexis debt` (or `d`) | `skills/lexis-two-debt/` | Harvest `// lexis:` comments |
| `/lexis security` (or `s`) | `skills/lexis-two-security/` | Security audit (Node/TS default) |
| `/lexis doubt` | `skills/lexis-two-doubt-driven/` | Clarify ambiguous requirements |
| `/lexis incremental` (or `inc`) | `skills/lexis-two-incremental-impl/` | Smallest vertical slice first |
| `/lexis debug` (or `triage`) | `skills/lexis-two-debug-triage/` | Minimal repro and fix |
| `/lexis source` (or `src`) | `skills/lexis-two-source-driven/` | Docs and repo-grounded design |
| `/lexis predict` | `skills/lexis-two-predict/` | Proposed vs lazy comparison |
| `/lexis scenario` | `skills/lexis-two-scenario/` | Happy / edge / failure scenarios |
| `/lexis help` (or `h`) | `skills/lexis-two-help/` | Quick reference |

Modes: [modes.md](./modes.md).

### Legacy aliases (deprecated)

| Alias | Use instead |
| ----- | ----------- |
| `/lexis-two` | `/lexis` + mode |
| `/lexis-two-review` | `/lexis review` |
| `/lexis-two-audit` | `/lexis audit` |
| `/lexis-two-debt` | `/lexis debt` |
| `/lexis-two-plan` | `/lexis plan` |
| `/lexis-two-security` | `/lexis security` |
| `/lexis-two-doubt-driven` | `/lexis doubt` |
| `/lexis-two-incremental-impl` | `/lexis incremental` |
| `/lexis-two-debug-triage` | `/lexis debug` |
| `/lexis-two-source-driven` | `/lexis source` |
| `/lexis-two-predict` | `/lexis predict` |
| `/lexis-two-scenario` | `/lexis scenario` |
| `/lexis-two-help` | `/lexis help` |

### Specxis (SDD)

| Command | Skill |
| ------- | ----- |
| `/specxis` | `skills/specxis/` — see [specxis.md](./specxis.md) |

Adapter files: Gemini `commands/*.toml`, OpenCode `.opencode/commands/*.md`, pi `pi-extension/index.js`.

## Portable Skills

| Skill | What it does |
| ----- | ------------ |
| `skills/lexis-two/` | Core ruleset + intensity levels |
| `skills/lexis-two-review/` | Diff review for over-engineering |
| `skills/lexis-two-audit/` | Full repo audit |
| `skills/lexis-two-debt/` | Harvest `// lexis:` comments into debt ledger |
| `skills/lexis-two-plan/` | Feature planning before coding |
| `skills/lexis-two-security/` | Security audit (default: Node.js / Next.js / MongoDB) |
| `skills/lexis-two-doubt-driven/` | Clarify requirements before code |
| `skills/lexis-two-incremental-impl/` | Vertical-slice delivery |
| `skills/lexis-two-debug-triage/` | Minimal bug triage |
| `skills/lexis-two-source-driven/` | Source- and doc-grounded design |
| `skills/lexis-two-predict/` | Approach comparison (LOC, deps, maintenance) |
| `skills/lexis-two-scenario/` | Scenario walkthrough before build |

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

# OpenCode (global) — plugin + commands:
# npx @draig/lexis-two install --host opencode --scope global --yes
# Config dir: ~/.config/opencode (Windows: %USERPROFILE%\.config\opencode)
```

## Config

Default mode resolution (hooks + pi + OpenCode plugin):

1. `LEXIS_TWO_DEFAULT_MODE` env var (`off` \| `lite` \| `full` \| `ultra`)
2. Config file: `~/.config/lexis-two/config.json` (Windows: `%APPDATA%\lexis-two\config.json`) with `{ "defaultMode": "full" }`
3. Fallback: `full`

Active mode flag (Claude Code): `~/.claude/.lexis-two-active`. OpenCode: `~/.config/opencode/.lexis-two-active`.
