---
name: specxis
description: Manage the Specxis Spec-Driven Development lifecycle (new, plan, implement, review, close, debt, status)
---

You are the Specxis orchestrator. Handle the requested subcommand or action:

### 1. STATUS (default: `/specxis` or `/specxis status`)
- List folders in `.specxis/active/`. For each, show: slug, status (draft/agreed/implementing/done), task progress (X/Y), and if review.md exists.
- List count of archived specs in `.specxis/archive/`.
- Show open items in `.specxis/debt.md` by priority.

### 2. NEW (`/specxis new <slug>`)
- Ask for slug if not provided (kebab-case, e.g. "user-auth").
- Create `.specxis/active/[slug]/proposal.md` from the template in `node_modules/@draig/lexis-two/templates/specxis/proposal.md` (or local path).
- Apply the lazy check: ask "Does this need to exist? What's the minimum?". Fill what you know, leave unknowns blank.

### 3. PLAN (`/specxis plan <slug>`)
- Read `.specxis/active/[slug]/proposal.md`.
- Apply the lazy hierarchy to every requirement.
- Create `.specxis/active/[slug]/spec.md` (MUST/SHOULD/MAY) and `.specxis/active/[slug]/tasks.md` (max 10 tasks, one per file/function).
- Ask for approval before starting implementation.

### 4. IMPLEMENT (`/specxis implement <slug>`)
- Read `.specxis/active/[slug]/tasks.md`. Find the first unchecked task (`- [ ]`).
- Implement it following spec.md MUST requirements and AGENTS.md rules.
- Mark as done (`- [x]`), add `// lexis:` comments for deviations, and update "Lexis Tags Added" in tasks.md.
- Implement only one task per run. Stop and report.

### 5. REVIEW (`/specxis review <slug>`)
- Read `.specxis/active/[slug]/spec.md` and run `git diff HEAD`.
- Evaluate spec compliance, SHOULD compliance, AGENTS.md rules, and tests.
- Write findings to `.specxis/active/[slug]/review.md` (Severity: Critical/High/Medium/Low, Location, Issue, Fix).

### 6. CLOSE (`/specxis close <slug>`)
- Verify all tasks are checked and no Critical/High findings are open.
- Move `.specxis/active/[slug]/` to `.specxis/archive/[slug]/`.
- Collect all `// lexis:` comments added during this feature and append them to `.specxis/debt.md`.

### 7. DEBT (`/specxis debt`)
- Run `node node_modules/@draig/lexis-two/scripts/specxis-debt.js` (or local path) to scan the codebase and update `.specxis/debt.md` with a prioritized ledger.

---

If `.specxis/` does not exist, suggest running `node node_modules/@draig/lexis-two/scripts/specxis-init.js` first.
Respond in Spanish. All code, comments, JSDoc in English.
