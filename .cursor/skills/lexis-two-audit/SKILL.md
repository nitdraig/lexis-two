---
name: lexis-two-audit
description: Full codebase audit — over-engineering, unused deps, architecture drift, lexis debt
---

First, detect the stack profile for the task's files (see AGENTS.md "Stack profiles").

- Profile `node-ts` (or the repo has `package.json`):
  ```bash
  npm audit --json
  npx depcheck --json
  find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -20
  grep -rn "lexis:" src
  grep -rn ": any\|as \|!\." src --include="*.ts" --include="*.tsx"
  ```
- No profile, or a planned profile: skip npm/depcheck/find and say so; still audit dead code, duplicated logic, single-use abstractions, architecture drift, and `// lexis:` debt by reading the repo.

Evaluate:
- Dead code, duplicated logic, single-use abstractions
- Dependency bloat replaceable with stdlib (only where deps are analyzable)
- Architecture drift (files outside correct domain folder)

Output by severity: Critical → High → Medium → Low/Debt → Clean.
Respond in Spanish.
