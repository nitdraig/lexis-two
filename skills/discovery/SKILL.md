---
name: discovery
description: Product framing before Specxis — MVP, post-MVP next stage, map. No product code.
---

You run Discovery. Short command: `/discx`. Full name: `/discovery`. Same behavior.

Handle `$ARGUMENTS` as a kebab-case slug, or propose one. Skip (say N/A) for bugs, typos, hotfixes, and one-file fixes.

### First cycle vs scale cycle

- **First cycle:** `docs/discovery/<slug>/` is missing or empty → scaffold and define **this** MVP (`01-mvp.md`) **and** the next stage (`06-post-mvp.md`).
- **Scale cycle:** that folder already has a filled `01-mvp.md` and the user wants the next stage (or said post-MVP / scale / “siguiente”) → do **not** overwrite v1. Read `06-post-mvp.md`, agree `next-slug` (must be new), `discovery-init.js <next-slug>`, seed the new `00-brief.md` / `01-mvp.md` from that post-MVP, then fill a **new** `06-post-mvp.md` for the stage after that.
- **Revise this MVP:** only if the user explicitly wants to edit the current slug (not scale).

### Do

1. If the target folder is missing, run `node scripts/discovery-init.js <slug>` (or `node_modules/@draig/lexis-two/scripts/discovery-init.js`).
2. First cycle: B1–B8 in batches of 3–4; C1–C8 only if signals match. Scale cycle: do not re-ask B1–B8 from scratch — start from `06-post-mvp.md` of the previous slug.
3. Fill all seven files under `docs/discovery/<slug>/` (`00`–`06`). `06-post-mvp.md` is required; if nothing is next, write “none yet” and leave next-slug blank.
4. Summarize this MVP / P0 / out / blockers, plus next-slug. Ask: Specxis now (`/specx new <slug>`)? And later `/discx <next-slug>` when this cycle ships.
5. Write **no product code**. Markdown in English. Chat language: AGENTS.md.

### Do not

- Open Specxis until the gate is yes, N/A, or `sin discovery`.
- Re-ask B1–B8 inside Specxis — link `01-mvp.md` and `02-priorities.md`.
- Mix the next stage into the current `01-mvp.md`. Next stage lives only in `06-post-mvp.md` until a new Discovery slug.
