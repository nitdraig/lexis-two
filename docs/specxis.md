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
| Style or naming change | No — after UI, use `/desx` for design quality or `/slopx` for generic-looking output |
| Adding tests to existing code | No |

Vague product ideas belong in [Discovery](./discovery.md) first (`docs/discovery/<slug>/`). Skip it for bugs and one-line fixes. Visual consistency: [desx.md](./desx.md).

### When Discovery is required / optional

OSS default is **optional**. `/specx new` (and `/specxis new`) **warns**, it does not hard-block.

| Situation | What Specxis should do |
|-----------|------------------------|
| `docs/discovery/<slug>/01-mvp.md` exists | Proceed; cite it in the proposal |
| Vague new product / “from scratch” / MVP and no MVP file | Suggest `/discx <slug>`; wait for confirm or Discovery |
| User said `no discovery` or `sin discovery` | Proceed; note `N/A — no discovery` in the proposal |
| Bug, hotfix, rename, one-file | Proceed; Discovery N/A — do not nag |
| Scale: new slug seeded from a previous `06-post-mvp.md` | Same as first cycle for that new slug |
| Existing Specxis-only repo with no `docs/discovery/` | Keep working as before |

## Workflow

Same subcommands as **`/specx`**.

```
/specxis new <slug>       → proposal.md (lazy check first)
/specxis plan <slug>      → spec.md (draft) + tasks.md; your approval makes it agreed
/specxis implement <slug> → one task at a time; refuses an unapproved spec; records the base commit
/specxis review <slug>    → review.md, from the diff since the base commit
/specxis close <slug>     → needs a review and no open High/Critical; status done, archive, debt sync
/specxis debt             ➔ sync technical debt to .specxis/debt.md
```

## Lifecycle

The `> Status:` line in `spec.md` is `draft`, `agreed`, `implementing` or `done`, and only `/specx` writes it.

- **Tasks** are one concern each and ship with their tests; the cap is 10 and there is no minimum.
- **The base commit** is stored in `tasks.md` on the first `implement` (`none` in a repo with no commits). Review and close diff against it, so small `checkpoint:` commits do not empty the review.
- **Findings** in `review.md` are checkboxes with a severity. Close refuses while a Critical or High one is unticked.
- **A criterion nobody can verify** (for example "works in a real host session") is closed only by a waiver line you write under **Waivers** in `review.md`. It is never ticked silently.
- **The debt ledger** is rewritten only between `<!-- lexis-debt:start -->` and `<!-- lexis-debt:end -->`; your notes and ticked entries stay.

## Key Principle

The lazy hierarchy applies to the spec itself.
Before adding a requirement to `spec.md`, ask: does it need to exist?
A good spec is short. A great spec is shorter.

## Integration with Lexis-One

When `.specxis/active/` exists, Lexis-One reads it automatically.
No configuration needed — the folder is the signal.
