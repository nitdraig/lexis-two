---
name: lexis-two-source-driven
description: Read official sources and existing code before inventing APIs
---

Before proposing or implementing, **ground in sources** — not memory.

1. Identify the stack (framework, library versions from `package.json` / lockfile / imports).
2. Read in-repo truth: types, existing callers, similar patterns (grep/read — don't assume).
3. Prefer official docs for APIs you will call (link or doc section name).
4. Propose the smallest approach that matches those sources.

Output:

- **Sources checked:** bullet list (file paths + doc URLs if used)
- **What exists already:** reuse opportunities
- **Recommendation:** one paragraph + code only if the user asked for implementation
- **Avoid:** APIs or patterns not supported by the versions in this repo

If official docs contradict the request, say so and offer the lazy compliant path.

Respond in Spanish.
