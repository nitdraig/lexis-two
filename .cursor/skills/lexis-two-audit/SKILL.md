---
name: lexis-two-audit
description: Full codebase audit — over-engineering, unused deps, architecture drift, lexis debt
---

Audit the entire repository.

Run:
- `npm audit --json` — security vulnerabilities
- `npx depcheck --json` — unused dependencies
- `find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -20` — oversized files
- `grep -rn "lexis:" src` — debt comments
- `grep -rn ": any\|as \|!\." src --include="*.ts" --include="*.tsx"` — type assertions

Evaluate:
- Dead code, duplicated logic, single-use abstractions
- Dependency bloat replaceable with stdlib
- Architecture drift (files outside correct domain folder)

Output by severity: Critical → High → Medium → Low/Debt → Clean.
Respond in Spanish.
