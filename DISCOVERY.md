# Discovery — product framing before Specxis

Discovery turns a vague idea into an **ordered MVP** and Markdown that feeds Specxis. It does not write product code.

Full process: [docs/discovery.md](./docs/discovery.md). After a go: [SPECXIS.md](./SPECXIS.md).

**Rule:** No Specxis proposal and **no product code** until the Discovery gate passes, Discovery is skipped as N/A (bug / trivial / hotfix), or the user says `sin discovery`.

---

## When to use

| Run Discovery | Skip |
|---------------|------|
| New product / empty repo with a vision | Clear bug with known fix |
| Large or vague feature | Typo / 1-file change |
| Need an MVP cut + priority order | Hotfix |
| Scale / next stage after an MVP | User said `sin discovery` |

Slug: English kebab-case (e.g. `family-shared-expenses`).

Scaffold without an LLM:

```bash
node scripts/discovery-init.js family-shared-expenses
```

Output: `docs/discovery/<slug>/` (seven files, including `06-post-mvp.md`). Command: **`/discx <slug>`** (full name `/discovery`).

---

## Canonical flow

```
vague idea
  → /discx <slug>              # this MVP + 06-post-mvp (next stage)
  → /specx new <slug>
  → ship / close
  → /desx audit                # optional, after UI — beside the loop
  → /discx <next-slug>         # scale: seed from previous 06-post-mvp
  → /specx new <next-slug>
```
