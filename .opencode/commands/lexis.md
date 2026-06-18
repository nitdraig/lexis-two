---
description: "Manage Lexis senior dev mode, intensity levels, and quality/security tools"
---

Handle the Lexis request: $ARGUMENTS

If empty or `status`: report current Lexis mode and default mode, then show the quick reference.

Subcommands (when $ARGUMENTS matches):
- `lite` / `full` / `ultra` / `off`: switch ruleset intensity (plugin persists mode).
- `plan` or `p`: plan a feature using the lazy hierarchy before coding.
- `review` or `r`: review current changes for over-engineering only.
- `audit` or `a`: audit the entire repository for over-engineering.
- `debt` or `d`: harvest all `// lexis:` comments into a tracked ledger.
- `security` or `s`: run a focused security audit on the stack.
- `help` or `h`: show the quick reference card.

Respond in Spanish.
