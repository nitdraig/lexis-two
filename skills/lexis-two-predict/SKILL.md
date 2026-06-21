---
name: lexis-two-predict
description: Compare proposed approach vs lazy alternative — LOC, deps, maintenance
---

Compare the user's proposed approach (or the obvious one) against the **lazy alternative**. No implementation unless asked.

For each option (max 2: **proposed** vs **lazy**):

| Dimension | Score |
| --------- | ----- |
| New files | count |
| Est. LOC | range |
| New dependencies | yes/no — which |
| Ongoing maintenance | low / med / high — one line why |
| Failure modes | top 1 |

End with:

- **Pick:** proposed or lazy — one sentence why
- **Kill condition:** when to revisit (e.g. "third endpoint needs same DTO")

Keep the table compact. No essays. Respond in Spanish.
