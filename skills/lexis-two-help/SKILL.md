---
name: lexis-two-help
description: Quick reference for lexis-two levels, skills, and commands
---

Show the lexis-two quick reference. One shot, change nothing: do not switch mode, write flag files, or persist anything.

Levels: `/lexis lite`, `/lexis full` (default), `/lexis ultra`, `/lexis off`. Only these write the active level.

Pillars: `/discx` Discovery · `/specx` Specxis · `/lexis` intensity + quality · `/desx` design audit (beside the loop).

Public `/lexis` (canonical):
- `status` — active + default mode
- `plan` — lazy plan (clarify, sources, compare, scenarios folded in)
- `review` — diff review for over-engineering (runs once, does not change the level)
- `audit` — whole-repo over-engineering audit
- `debt` — harvest `// lexis:` comments
- `security` — security audit (Node/TS default)
- `help` — this card

Removed as slash (redirect to `/lexis plan` or `/discx`): `doubt`, `incremental`/`inc`, `debug`/`triage`, `source`/`src`, `predict`, `scenario`. `/lexis discovery`/`discx` → `/discx`. Legacy `/lexis-two-review` etc. still work with a deprecation notice. Folded `lexis-two-doubt-driven` slash files are gone; skill folders remain for @skill.

Ship one vertical slice. Bugs: smallest fix, no drive-by refactors.

Deactivate: send `stop lexis` or `normal mode` as the whole message, or `/lexis off`. Default mode: `LEXIS_TWO_DEFAULT_MODE` or `~/.config/lexis-two/config.json`. Reply language: `LEXIS_TWO_LANGUAGE` or `language` in that file.

Respond in the user's language unless the project's rules set one.
