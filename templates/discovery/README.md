# Discovery templates

Copy into the project as:

```
docs/discovery/<slug>/
  00-brief.md
  01-mvp.md
  02-priorities.md
  03-constraints.md
  04-open-questions.md
  05-map.md
  06-post-mvp.md           # next stage; seeds the following /discx
```

Replace `{{slug}}` with the English kebab-case slug, or run:

```bash
node scripts/discovery-init.js <slug>
```

Process: [docs/discovery.md](../../docs/discovery.md). After a go: [docs/specxis.md](../../docs/specxis.md).
