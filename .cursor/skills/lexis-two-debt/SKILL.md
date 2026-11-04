---
name: lexis-two-debt
description: "Harvest all lexis: comments into a prioritized technical debt ledger"
---

Scan the codebase for `// lexis:` comments:

```bash
grep -rn "lexis:" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.mjs" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=build
```

For each entry: extract file/line, decision made, ceiling or upgrade path if mentioned.

Produce a prioritized ledger:
- **Immediate**: shortcuts already causing pain or blocking features
- **Next sprint**: shortcuts with a known ceiling approaching
- **Backlog**: simplifications fine for now, revisit at scale
- **Permanent**: intentional, no action needed

Format: `[priority] file:line — Decision — Trigger (if stated)`

Respond in the user's language unless the project's rules set one.
