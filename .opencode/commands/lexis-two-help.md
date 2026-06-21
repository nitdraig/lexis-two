---
description: Quick reference for lexis-two levels, skills, and commands
---

Show the lexis-two quick reference. One shot, change nothing: do not switch mode, write flag files, or persist anything.

Levels: `/lexis lite`, `/lexis full` (default), `/lexis ultra`, `/lexis off`.

Commands (canonical `/lexis <name>`; skills live under `lexis-two-*`):
- `plan` — lazy feature plan before coding
- `review` — diff review for over-engineering
- `audit` — whole-repo over-engineering audit
- `debt` — harvest `// lexis:` comments
- `security` — security audit (Node/TS default)
- `doubt` — clarify ambiguous requirements (no code)
- `incremental` — smallest vertical slice first
- `debug` — minimal repro and smallest fix
- `source` — ground in docs and existing code
- `predict` — proposed vs lazy comparison
- `scenario` — happy / edge / failure scenarios
- `help` — this card

Legacy `/lexis-two-*` names still work with a deprecation notice.

Deactivate: `stop lexis`, `normal mode`, or `/lexis off`. Default mode: `LEXIS_TWO_DEFAULT_MODE` or `~/.config/lexis-two/config.json`.
