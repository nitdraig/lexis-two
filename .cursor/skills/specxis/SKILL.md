---
name: specxis
description: Manage the Specxis Spec-Driven Development lifecycle (new, plan, implement, review, close, debt, status)
---

You are the Specxis orchestrator. Handle the requested subcommand or action.
Short alias: `/specx` (same as `/specxis`).

Status values, in order: `draft` -> `agreed` -> `implementing` -> `done`. Only this skill writes the line `> Status: <value>` in `spec.md`, at the steps below.

### 1. STATUS (default: `/specxis`, `/specx`, or `/specxis status`)
- List folders in `.specxis/active/`. For each, show: slug, status (read from `spec.md`), task progress (X/Y), base commit (from `tasks.md`), whether `review.md` exists, and how many High or Critical findings are still unticked in it.
- List count of archived specs in `.specxis/archive/`.
- Show open items in `.specxis/debt.md` by priority.

### 2. NEW (`/specxis new <slug>` or `/specx new <slug>`)
- Ask for slug if not provided. It must match `^[a-z0-9]+(-[a-z0-9]+)*$` (kebab-case, e.g. "user-auth"). Refuse anything else, and refuse a slug that already exists in `.specxis/active/` or `.specxis/archive/`.
- **Discovery soft gate** (warn, never refuse forever):
  1. If the user said `no discovery` or `sin discovery` (or equivalent) → proceed. In `proposal.md` **Discovery source** write `N/A — no discovery`.
  2. Else if `docs/discovery/<slug>/01-mvp.md` exists → proceed. Cite that MVP (one-liner + P0 from `02-priorities.md` if present) in **Discovery source**. If `00-brief.md` or `01-mvp.md` mentions a previous `06-post-mvp.md`, link that path too (scale cycle).
  3. Else if the request looks like a **new product / large vague feature** → do **not** create the spec yet. Suggest `/discx <slug>` first. Ask to confirm bypass. Only create `proposal.md` after they confirm or run Discovery.
  4. Else (bug, rename, single-file, clearly scoped feature) → proceed. Discovery source: `N/A`.
- Vague heuristic (dumb, documented, bilingual on purpose so it does not depend on the reply language): keywords such as `app`, `platform` / `plataforma`, `product` / `producto`, `I want a` / `quiero una`, `from scratch`, `MVP`; or empty/nearly empty repo plus a multi-surface ask. **Never** nag for bugfix / hotfix / typo / one-file.
- Then create `.specxis/active/[slug]/proposal.md` from `templates/specxis/proposal.md` (package or local path).
- Apply the lazy check: ask "Does this need to exist? What's the minimum?". Fill what you know, leave unknowns blank.

### 3. PLAN (`/specxis plan <slug>`)
- Read `.specxis/active/[slug]/proposal.md`.
- Apply the lazy hierarchy to every requirement.
- Create `.specxis/active/[slug]/spec.md` (MUST/SHOULD/MAY) with `> Status: draft`, and `.specxis/active/[slug]/tasks.md` (max 10 tasks). One task is one concern and ships with its own tests; split a task that spans more than one. Constraints come from the matching `stacks/<id>.md` profile, not from a fixed language.
- If `tasks.md` already has checked tasks, keep them and ask before dropping or renumbering any.
- Ask for approval. On an explicit yes, change the status line to `> Status: agreed`. Without a yes, leave `draft` and stop.

### 4. IMPLEMENT (`/specxis implement <slug>`)
- Read `spec.md`. If the status is not `agreed` or `implementing`, refuse and say why: "Run /specx plan <slug> and approve it first." Do nothing else.
- Read `.specxis/active/[slug]/tasks.md`. Find the first unchecked task (`- [ ]`).
- On the first run for this spec: set the status to `implementing`, and replace the placeholder after `Base commit:` in `tasks.md` with `git rev-parse HEAD`, or with `none` when there is no commit yet or the folder is not a git repo.
- Implement the task following spec.md MUST requirements and AGENTS.md rules.
- Mark as done (`- [x]`), add `// lexis:` comments for deviations, and update "Lexis Tags Added" in tasks.md.
- Implement only one task per run. Stop and report.

### 5. REVIEW (`/specxis review <slug>`)
- Read `.specxis/active/[slug]/spec.md` and the `Base commit:` in `tasks.md`.
- Diff against that base, not against `HEAD`, so checkpoint commits stay in the review: `git diff <base>`. For `none`, diff against the empty tree: `git diff $(git hash-object -t tree /dev/null)`, and read untracked files from `git status --short` too, since that diff only covers tracked and staged files.
- Evaluate spec compliance, SHOULD compliance, AGENTS.md rules, and tests.
- Write `.specxis/active/[slug]/review.md` from the template. Each finding is a checkbox line with severity (Critical/High/Medium/Low), `file:line`, issue and fix.

### 6. CLOSE (`/specxis close <slug>`)
- Verify every task is checked.
- Verify `review.md` exists. If it does not, ask the user to run review, or to write a waiver line in `spec.md`.
- Refuse while a Critical or High finding is unticked in `review.md`.
- An acceptance criterion that cannot be verified here (for example a real host session) is closed only through a waiver line under **Waivers** in `review.md`, written by the user: criterion, reason, who accepted it. Never tick it silently.
- Refuse if `.specxis/archive/[slug]/` already exists.
- Set the status to `> Status: done`, then move `.specxis/active/[slug]/` to `.specxis/archive/[slug]/`.
- Run the debt script (section 7) so the `// lexis:` comments added during this feature reach `.specxis/debt.md`.

### 7. DEBT (`/specxis debt`)
- Run `node node_modules/@draig/lexis-two/scripts/specxis-debt.js` (or local path) from the project root. It rewrites only the block between `<!-- lexis-debt:start -->` and `<!-- lexis-debt:end -->` in `.specxis/debt.md`, keeps ticked entries, and leaves every other line alone.

---

If `.specxis/` does not exist, suggest running `node node_modules/@draig/lexis-two/scripts/specxis-init.js` first.
Respond in the user's language unless the project's rules set one. All code, comments, JSDoc in English.
