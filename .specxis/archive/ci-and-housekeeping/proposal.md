# Proposal: ci-and-housekeeping

## Goal
CI catches what the review had to find by hand, and stale material leaves the repo.

## Lazy Check
- Does this need to exist? Yes. Manifest errors and a broken site can both reach `main` today.
- Does stdlib, the framework, or an installed dep already cover it? `node --check`, `astro build`, `claude plugin validate`. No ESLint for now.
- What is the absolute minimum? A syntax-check script, three CI additions, and deletions.

## Discovery source
- Path: N/A (tooling and cleanup)

## Context
- Affected: `.github/workflows/test.yml`, `package.json`, `plans/`, `site/public/redesing/`, (`scripts/specxis-init.js` and `templates/specxis/` moved to fix-specx).
- Findings: M2, M3b, M4, M5, M6, M8b, S16 in [improvement-plan.md](../../improvement-plan.md).
- Plan 001's proposed command is wrong: `node --check a.js b.js` only checks the first file (verified: exit 0 with a broken second file).

## Out of Scope (YAGNI)
- ESLint or style linting.
- Writing `AGENTS.template.md` and `docs/core.md`: plans 003 and 005 stay as unchecked README roadmap items.
- Pinning actions by SHA.

## Decisions
- D4: delete `plans/`. Approved on 2026-11-03; still pending, since the deletion was blocked by a permission rule. Recoverable from git history once done.

## Open Questions
- Can Claude Code's validator run in CI without authentication? Task 002 confirms; otherwise it stays a documented local check.
- Will the Windows matrix pass as is? Unknown until it runs; fixes may be needed.
