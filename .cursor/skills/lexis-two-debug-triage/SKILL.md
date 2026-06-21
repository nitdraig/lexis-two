---
name: lexis-two-debug-triage
description: Minimal reproduction and smallest fix — no drive-by refactors
---

Debug the reported issue. **Fix the bug, not the codebase.**

Steps:

1. **Reproduce:** state exact steps or the failing command/output. If not reproducible, say what's missing.
2. **Hypothesis:** one primary cause (two max if tied).
3. **Evidence:** file:line or log line — no guessing without reading.
4. **Fix:** smallest diff that fixes the root cause. No unrelated cleanup.
5. **Verify:** one command or test that proves the fix.

Forbidden during triage:

- New libraries, new layers, "while we're here" refactors
- Renaming unrelated symbols
- Broad error-handler rewrites

If the lazy fix is a one-liner, ship the one-liner. Mark intentional shortcuts with `// lexis:`.

Output: Repro → Cause → Fix (with paths) → Verify. Respond in Spanish.
