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

Fold these into the same plan (do not ask the user to run extra slash commands):

- **Clarify:** if the request is vague, restate it in one sentence, ask at most 3 questions, and state the lazy default if they say "whatever is simplest."
- **Sources:** check repo truth (types, callers, lockfile versions) and official docs before inventing APIs.
- **Compare:** proposed vs lazy — files, LOC, new deps, maintenance, one failure mode. Pick one; name a kill condition.
- **Scenarios:** happy path, one edge, one failure. v1 is what all three share; defer the rest.

When this later becomes implementation (not this command): one vertical slice, no scaffolding for later. Bugs: repro → smallest fix → verify; no drive-by refactors.

Plan structure:
- **Goal**: one sentence
- **Lazy check**: what was ruled out and why
- **Clarify / sources / compare / scenarios**: only the bits that apply (keep short)
- **Files to create**: with purpose (1 sentence each)
- **Files to modify**: with what changes and why
- **New dependencies**: only if unavoidable — name the alternative considered
- **Risks and unknowns**
- **Out of scope** (explicit YAGNI)
- **Questions** needing clarification before starting
- **Slice 1 / deferred**: if the feature is larger than one shippable step

Do not write any code. Plan only. Ask if unclear.
Respond in Spanish.
