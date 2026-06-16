---
name: lexis-two-review
description: Review the current diff for over-engineering, rule violations, and unnecessary complexity
---

Review the current diff (run `git diff HEAD` if not already in context).

Evaluate against Lexis-Two rules:

1. **Lazy check**: Is there a simpler native/stdlib/existing-dep solution?
2. **Abstraction check**: Was any abstraction added that wasn't explicitly requested?
3. **Dependency check**: Was a new dependency introduced that could have been avoided?
4. **TypeScript check**: Any `any`, `as`, or `!` without a `// lexis:` explanation?
5. **Size check**: Any file exceeding 150 lines that should be split?
6. **Test check**: Is there new behavior without a corresponding test?
7. **Error states**: Does every new UI action have loading, error, and empty states?

Output:
- **Summary**: one sentence on overall quality
- **Delete list**: things to remove or simplify, with file/line refs
- **Violations**: rule breaks with file/line refs and suggested fix
- **Next steps**: concrete actions in priority order

Respond in Spanish.
