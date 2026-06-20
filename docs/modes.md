# Lexis-Two Modes

Intensity levels control how aggressively the agent applies the lazy senior dev ladder. Default is **full**.

See also: [portability.md](./portability.md) (config resolution), [setup.md](./setup.md) (install).

## Levels

| Mode | Command | When to use |
| ---- | ------- | ----------- |
| **lite** | `/lexis lite` | Build what was asked; mention a lazier alternative in one line. Good when requirements are fixed and you only want a nudge. |
| **full** | `/lexis full` or `/lexis` (default) | Enforce YAGNI → stdlib → native → one line → minimum code. Default for daily work. |
| **ultra** | `/lexis ultra` | Deletion before addition; challenge the requirement; ship the smallest diff. Refactors, debt sprints, audits. |
| **off** | `/lexis off` | Disable rules injection for the session. Also: say `stop lexis` or `normal mode` in chat (hooks). |
| **review** | `/lexis review` | Special mode used by hooks when running review — not a persistence tier; see skill `lexis-two-review`. |

### Quick examples

**Cache request in ultra:**

> User: Add Redis cache for user lookups.  
> Agent: No cache until profiling proves it. If needed: `dict` + TTL first; Redis when multi-process sharing is required.

**Fixed API contract in lite:**

> User: Must match OpenAPI schema exactly.  
> Agent: Implements schema; notes `zod` could be one model if the second endpoint reuses the shape.

## Switching modes

| Host | How |
| ---- | --- |
| OpenCode | `/lexis lite\|full\|ultra\|off` — plugin persists to `~/.config/opencode/.lexis-two-active` |
| Claude / Codex / Copilot | Hooks via `lexis-two-mode-tracker.js` on `/lexis` or `/lexis-two` |
| pi | `/lexis` command in `pi-extension` |
| Rules-only (Cursor, etc.) | No runtime switch — rules always on; use chat phrases or a project note |

Check active mode: `/lexis status`.

## Default mode (not session mode)

Resolution order for **default** when a session starts:

1. `LEXIS_TWO_DEFAULT_MODE` env (`off` \| `lite` \| `full` \| `ultra`)
2. Config file `~/.config/lexis-two/config.json` (Windows: `%APPDATA%\lexis-two\config.json`) — `{ "defaultMode": "full" }`
3. Fallback: `full`

Set default without changing current session: `/lexis default ultra` (pi/OpenCode where supported).

## Custom modes

Not supported as first-class plugins today. Practical options:

1. **Project instructions** — add a short paragraph to `AGENTS.md` (e.g. "in this repo always prefer SQLite over Postgres").
2. **Env default** — `LEXIS_TWO_DEFAULT_MODE=lite` in CI or devcontainer.
3. **Skill fork** — copy `skills/lexis-two/SKILL.md` intensity table for a team variant (keep in repo, not npm).

Contributing a new built-in mode: see [CONTRIBUTING.md](../CONTRIBUTING.md) — requires hook + plugin + instruction builder changes.

## Naming

- User-facing switch: `/lexis <mode>`
- Legacy alias: `/lexis-two <mode>` (deprecated, still works)
- Internal skill package id: `lexis-two` (folder `skills/lexis-two/`)
