---
name: lexis-two-plan
description: Plan a feature using the lazy decision hierarchy before writing any code
---

Before writing a single line of code, produce a plan applying the lazy hierarchy to every piece:

1. Does this need to exist? → Can the requirement be met without building it?
2. Stdlib/native? → Does the platform already do this?
3. Existing dep? → Does an already-installed package cover it?
4. One line? → Can this be a single expression?
5. Minimum build → Only then: what's the smallest thing that works?

Plan structure:
- **Goal**: one sentence
- **Lazy check**: what was ruled out and why
- **Files to create**: with purpose (1 sentence each)
- **Files to modify**: with what changes and why
- **New dependencies**: only if unavoidable — name the alternative considered
- **Risks and unknowns**
- **Out of scope** (explicit YAGNI)
- **Questions** needing clarification before starting

Do not write any code. Plan only. Ask if unclear.
Respond in Spanish.
