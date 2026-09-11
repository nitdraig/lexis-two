# Discovery — process

Product framing before Specxis. Public summary: [DISCOVERY.md](../DISCOVERY.md). Specxis lifecycle: [specxis.md](./specxis.md).

**Rule:** No Specxis proposal and **no product code** until the Discovery gate passes, Discovery is N/A, or the user says `sin discovery`.

---

## When to run

| Run Discovery | Skip |
|---------------|------|
| New product / empty repo with a vision | Clear bug with known fix |
| Large or vague feature (“I want an app that…”) | Typo / 1-file trivial |
| Need MVP cut + priority order | Hotfix |
| Multiple possible scopes | User says `sin discovery` (note in the Specxis proposal) |
| Scale / next stage (`06-post-mvp.md`) | Same skips as above |

Command: **`/discx <slug>`** (full name `/discovery`). Scaffold: `node scripts/discovery-init.js <slug>`.

Slug: English kebab-case (e.g. `family-shared-expenses`).

---

## Output folder

```
docs/discovery/<slug>/
  00-brief.md           # context from base questions
  01-mvp.md             # in / out / success for v1
  02-priorities.md      # ordered backlog (MoSCoW + sequence)
  03-constraints.md     # tech, time, legal, platforms
  04-open-questions.md  # unresolved; block Specxis if critical
  05-map.md             # domains, actors, main flows
  06-post-mvp.md        # next stage after this MVP (scale cycle)
```

Skeletons: `templates/discovery/` in this package. Chat: follow `AGENTS.md` (Spanish in this ecosystem). Doc bodies: **English**.

---

## Step-by-step

### Step 0 — Setup

1. Agree `slug` with the user.
2. Create `docs/discovery/<slug>/` from templates (`discovery-init.js` or copy). Ask before writing if unsure.

### Step 1 — Base questions (always)

Ask in **batches of 3–4** (do not dump all at once). Record answers in `00-brief.md`.

| # | Question | Captures |
|---|----------|----------|
| B1 | What painful problem are we solving, in one sentence? | Problem |
| B2 | Who is the primary user? Any secondary users? | Actors |
| B3 | How do we know v1 worked? (one measurable or observable success) | Success |
| B4 | What must v1 **not** include? | Non-goals |
| B5 | Web, mobile, both, API-only, or internal tool? | Surface |
| B6 | Solo user, small group, or many orgs/customers? | Scale shape |
| B7 | Hard deadline or soft? Approx hours/days for MVP? | Timebox |
| B8 | Any must-use stack, hosting, or “already decided” tech? | Tech constraints |

If the user is stuck, propose **Option A / B** for B5–B6 and recommend one.

### Step 2 — Complementary questions (pick by signals)

Ask only blocks that apply. Record in `00-brief.md` + `03-constraints.md`.

#### C1 — Multi-user / groups (if B6 ≠ solo)

- How do people join a group (invite link, admin adds, domain)?
- Roles needed in v1? (admin / member / viewer)
- What is private vs shared?

#### C2 — Money / balances (if money, splits, invoices, wallets)

- Real payments (Stripe, etc.) in v1 or **balances only**?
- Currencies? Single currency OK for MVP?
- Who can mark a debt as settled?

#### C3 — Auth & identity

- Email/password, magic link, OAuth, or anonymous+invite for v1?
- Need guest access without full account?

#### C4 — Content / catalog (if marketplace, CMS, feed)

- Who creates content? Moderation in v1?
- Search required for MVP?

#### C5 — Integrations

- Must integrate with anything on day one? (calendar, bank, WhatsApp, ERP)
- If none → write “none for MVP” in constraints.

#### C6 — Compliance / sensitive data

- Personal data, minors, health, financial regs?
- Data residency or retention rules?

#### C7 — Ops / admin

- Need an admin panel in v1 or only user app?
- Metrics/analytics minimum?

#### C8 — Offline / realtime

- Offline-first? Live updates (websockets) required for MVP?

Stop complementary when enough to fill MVP + priorities. Do not interview forever.

### Step 3 — Write the docs

Fill templates in order:

1. `00-brief.md` — answers synthesized
2. `01-mvp.md` — **MVP definition** (in / out / success / anti-goals)
3. `02-priorities.md` — MoSCoW + **implementation order** (P0 → P3)
4. `03-constraints.md` — stack, time, legal, platforms
5. `04-open-questions.md` — only real blockers / nice unknowns
6. `05-map.md` — domains, actors, 3–7 main flows (ASCII ok, max 15 lines)
7. `06-post-mvp.md` — **next stage only** (next slug + in/out). Not mixed into `01-mvp.md`. “None yet” is allowed.

### Step 4 — Propose this cut + next gate

In chat, short:

```
This cycle (slug): …
MVP: <one sentence>
P0 (must ship): …
Out: …
Next slug (from 06-post-mvp): … or none
Open blockers: … or none
Continue to Specxis with slug <slug>?
Later: /discx <next-slug> after this cycle ships (scale).
Optional after UI: /desx audit (not a Specxis phase).
```

### Step 5 — Gate (this cycle)

| Answer | Next |
|--------|------|
| Yes | `/specx new <slug>` — proposal must align with `01-mvp.md` + P0 in `02-priorities.md` |
| Adjust | Edit docs, re-state MVP, ask again |
| No | Stop; do not open Specxis |

### Step 6 — Scale (repeat Discovery)

When this Specxis is closed (or the user chooses to scale earlier):

1. Open `docs/discovery/<slug>/06-post-mvp.md`.
2. Run `/discx <next-slug>` (new folder). Seed the new MVP from that post-MVP. Do not overwrite the previous folder.
3. Fill a new `06-post-mvp.md` for the stage after that.
4. Gate again → `/specx new <next-slug>`.

Same command, same docs shape, next product slice.

Critical items in `04-open-questions.md` marked **BLOCKER** → resolve or explicitly defer before Specxis.

---

## How docs feed the rest

| Discovery doc | Feeds |
|---------------|--------|
| `01-mvp.md` | Specxis `proposal.md` scope |
| `02-priorities.md` | Specxis `tasks.md` order; release slicing |
| `03-constraints.md` | Stack choices; AGENTS notes |
| `05-map.md` | UX flows; `spec.md` domains/API sketch |
| `04-open-questions.md` | Risks in proposal; spike tasks |
| `06-post-mvp.md` | Next `/discx <next-slug>` — that cycle’s `01-mvp.md` |

---

## MoSCoW + order (required in `02-priorities.md`)

- **Must** — no MVP without these
- **Should** — important, after Must
- **Could** — nice if time
- **Won’t (v1)** — explicit exclusions

Then **sequence**: Must items ordered 1..n for implementation (dependencies first: auth → core entity → primary flow → polish).

---

## Agent rules

- Markdown: English (clear for Specxis/code). Chat language: `AGENTS.md`.
- No emojis. No product code during Discovery.
- Batch questions.
- Prefer files under `docs/discovery/<slug>/` over long chat essays.
- After gate yes → hand off to Specxis; **link** these docs instead of re-asking B1–B8.
- Scale: new slug, seed from previous `06-post-mvp.md`; never overwrite the old folder.

---

## Example slug

Idea: family shared expenses → slug `family-shared-expenses` → folder `docs/discovery/family-shared-expenses/`. After that cycle ships → `/discx family-settlements` seeded from `06-post-mvp.md`.
