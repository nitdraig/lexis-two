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

Vague product ideas belong in [Discovery](./discovery.md) first (`docs/discovery/<slug>/`). Skip it for bugs and one-line fixes.

### When Discovery is required / optional

OSS default is **optional**. `/specx new` (and `/specxis new`) **warns**, it does not hard-block.

| Situation | What Specxis should do |
|-----------|------------------------|
| `docs/discovery/<slug>/01-mvp.md` exists | Proceed; cite it in the proposal |
| Vague new product / “from scratch” / MVP and no MVP file | Suggest `/discx <slug>`; wait for confirm or Discovery |
| User said `sin discovery` | Proceed; note `N/A — sin discovery` in the proposal |
| Bug, hotfix, rename, one-file | Proceed; Discovery N/A — do not nag |
| Scale: new slug seeded from a previous `06-post-mvp.md` | Same as first cycle for that new slug |
| Existing Specxis-only repo with no `docs/discovery/` | Keep working as before |

## Workflow

Same subcommands as **`/specx`**.

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
