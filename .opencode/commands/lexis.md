---
description: "Manage Lexis senior dev mode, intensity levels, and quality/security tools"
---

Handle the Lexis request: $ARGUMENTS

If empty or `status`: report current Lexis mode and default mode, then show the quick reference.

Public subcommands (teach these):
- `lite` / `full` / `ultra` / `off`: switch ruleset intensity (plugin persists mode).
- `plan` or `p`: lazy plan before coding (includes clarify, sources, compare, scenarios).
- `review` or `r`: review current changes for over-engineering only.
- `audit` or `a`: audit the entire repository for over-engineering.
- `debt` or `d`: harvest all `// lexis:` comments into a tracked ledger.
- `security` or `s`: run a focused security audit on the stack.
- `help` or `h`: show the quick reference card.

Compat (redirect, then run the public skill):
- `doubt`, `source`, `predict`, `scenario`, `incremental`/`inc`, `debug`/`triage` → `/lexis plan`.
- `discovery` / `discx` → prefer top-level `/discx`, then still run Discovery.

Legacy `lexis-two-*` slash names still work but are deprecated.

Respond in Spanish.
