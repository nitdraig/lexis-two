---
description: "Discovery — product framing before Specxis. Short alias: /discx"
---

Run Discovery for: $ARGUMENTS

Short name: `/discx`. Full name: `/discovery`. Same behavior. No product code. Chat: Spanish. Docs: English.

Treat `$ARGUMENTS` as a kebab-case slug, or propose one. Skip (say N/A) for bugs, typos, hotfixes, and one-file fixes.

## First cycle vs scale cycle

- **First cycle:** `docs/discovery/<slug>/` is missing or empty → scaffold and define **this** MVP (`01-mvp.md`) **and** the next stage (`06-post-mvp.md`).
- **Scale cycle:** that folder already has a filled `01-mvp.md` and the user wants the next stage → do **not** overwrite v1. Read `06-post-mvp.md`, agree `next-slug`, scaffold the new folder, seed from that post-MVP, write a **new** `06-post-mvp.md`.
- **Revise this MVP:** only if the user explicitly wants to edit the current slug (not scale).

## Do

1. If the folder is missing, run `node node_modules/@draig/lexis-two/scripts/discovery-init.js <slug>` (or `node scripts/discovery-init.js` in the lexis-two repo). If neither exists, copy from the package `templates/discovery/`.
2. Follow `docs/discovery.md` (or `node_modules/@draig/lexis-two/docs/discovery.md`): B1–B8 in batches of 3–4; C1–C8 only if signals match. Scale cycle: start from previous `06-post-mvp.md`, do not re-ask B1–B8 from scratch.
3. Fill all seven files under `docs/discovery/<slug>/` (`00`–`06`). `06-post-mvp.md` is required; if nothing is next, write “none yet” and leave next-slug blank.
4. Summarize this MVP / P0 / out / blockers, plus next-slug. Ask: Specxis now (`/specx new <slug>`)? Later `/discx <next-slug>` when this cycle ships.
5. Write **no product code**.

## Do not

- Open Specxis until the gate is yes, N/A, or `sin discovery`.
- Mix the next stage into the current `01-mvp.md`.
