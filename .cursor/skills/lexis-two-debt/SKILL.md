---
name: lexis-two-debt
description: Harvest all lexis: comments into a prioritized technical debt ledger
---

Scan the codebase for `// lexis:` comments:

```bash
grep -rn "lexis:" src --include="*.ts" --include="*.tsx" --include="*.js" --include="*.mjs"
```

For each entry: extract file/line, decision made, ceiling or upgrade path if mentioned.

Produce a prioritized ledger:
- **Immediate**: shortcuts already causing pain or blocking features
- **Next sprint**: shortcuts with a known ceiling approaching
- **Backlog**: simplifications fine for now, revisit at scale
- **Permanent**: intentional, no action needed

Format: `[priority] file:line — Decision — Trigger (if stated)`

Respond in Spanish.
