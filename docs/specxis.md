# Specxis — Spec-Driven Development for Lexis

Specxis is the lightweight SDD (Spec-Driven Development) layer built into Lexis-Two.
Inspired by OpenSpec and GitHub Spec Kit, adapted to the Lexis philosophy.

## When to use

| Situation | Use Specxis? |
|-----------|-------------|
| Feature touching 3+ files | Yes |
| UX + backend coordination | Yes |
| Ambiguous requirements | Yes |
| Bug fix with clear cause | No |
| Style or naming change | No |
| Adding tests to existing code | No |

## Workflow

```
/specxis new <slug>       → proposal.md (lazy check first)
/specxis plan <slug>      → spec.md + tasks.md
/specxis implement <slug> → one task at a time
/specxis review <slug>    → review.md
/specxis close <slug>     → archive + debt sync
/specxis debt             ➔ sync technical debt to .specxis/debt.md
```

## Key Principle

The lazy hierarchy applies to the spec itself.
Before adding a requirement to `spec.md`, ask: does it need to exist?
A good spec is short. A great spec is shorter.

## Integration with Lexis-One

When `.specxis/active/` exists, Lexis-One reads it automatically.
No configuration needed — the folder is the signal.
