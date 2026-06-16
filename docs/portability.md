# Agent Portability

Lexis-two is an agent-portable ecosystem. The `skills/` folder holds the core behavior.
Host-specific files are thin adapters that point to those skills.

## Supported Hosts

| Host               | Files                                                                    | Level                                    |
| ------------------ | ------------------------------------------------------------------------ | ---------------------------------------- |
| OpenCode           | `.opencode/plugins/lexis.mjs`, `.opencode/command/`, `hooks/`, `skills/` | Full — plugin + mode switches + commands |
| Cursor             | `.cursor/rules/lexis.mdc`                                                | Rules — always-on project rule           |
| Windsurf           | `.windsurf/rules/lexis.md`                                               | Rules — project rule                     |
| Cline              | `.clinerules/lexis.md`                                                   | Rules — project rule                     |
| GitHub Copilot     | `.github/copilot-instructions.md`                                        | Rules — repository instruction           |
| GitHub Copilot CLI | `AGENTS.md` or `~/.copilot/copilot-instructions.md`                      | Rules — no mode switches                 |
| Gemini CLI         | `gemini-extension.json`, `AGENTS.md`, `commands/`, `skills/`             | Full — extension manifest                |
| Kiro               | `.kiro/steering/lexis.md`                                                | Rules — steering rule                    |
| VS Code + Codex    | `AGENTS.md` or `~/.codex/AGENTS.md`                                      | Rules — instruction tier                 |
| Antigravity        | `AGENTS.md` or `.agents/rules/`                                          | Rules — instruction tier                 |
| Generic agents     | `AGENTS.md` or `skills/*/SKILL.md`                                       | Rules — copy and load                    |

## Adapter Rule

Keep adapters thin. When a host supports skills or hooks, point it at the
existing `skills/` and `hooks/` files. When a host only supports project
instructions, keep its rule text aligned with `AGENTS.md`.

## Global Install (any host)

Copy the relevant rules file to your global config:

```bash
# Cursor (global)
cp .cursor/rules/lexis.mdc ~/.cursor/rules/lexis.mdc

# GitHub Copilot CLI (global)
cp AGENTS.md ~/.copilot/copilot-instructions.md

# VS Code + Codex (global)
cp AGENTS.md ~/.codex/AGENTS.md

# OpenCode (global)
# Add to ~/.config/opencode/opencode.json:
# { "plugin": ["~/lexis-two/.opencode/plugins/lexis.mjs"] }
```

## Portable Skills

| Skill                    | What it does                                     |
| ------------------------ | ------------------------------------------------ |
| `skills/lexis/`          | Lazy senior dev mode — core ruleset              |
| `skills/lexis-review/`   | Diff review for over-engineering                 |
| `skills/lexis-audit/`    | Full repo audit                                  |
| `skills/lexis-debt/`     | Harvest `lexis:` comments into debt ledger       |
| `skills/lexis-plan/`     | Feature planning before coding                   |
| `skills/lexis-security/` | Security audit for Node.js/Next.js/MongoDB stack |
