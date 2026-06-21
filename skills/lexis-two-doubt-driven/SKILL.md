---
name: lexis-two-doubt-driven
description: Challenge ambiguous requirements with minimal questions before any code
---

The user request is underspecified or scope is unclear. **Do not write code yet.**

Apply YAGNI at the requirement level:

1. Restate what you think they want in one sentence.
2. Ask at most **3** razor questions that unblock the laziest correct implementation.
3. For each question, suggest the default you'd pick if they say "whatever is simplest."

Question targets (pick only what applies):

- Does this feature need to exist at all, or does an existing flow cover it?
- What is the smallest user-visible outcome that counts as done?
- What can be explicitly out of scope for v1?

Output format:

- **Assumption:** …
- **Questions:** numbered 1–3
- **Lazy default if no answer:** one line

No code, no file edits, no new dependencies. Respond in Spanish.
