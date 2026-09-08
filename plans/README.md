# Improvement plans

This directory contains self-contained plans produced from a full-project review. Each plan targets one high-leverage improvement and can be executed by a model with no prior session context.

## Findings summary

| # | Finding | Leverage | Category |
|---|---------|----------|----------|
| 1 | `npm run lint` does not exist despite AGENTS.md requiring it | HIGH | DX/CI |
| 2 | `hooks/lexis-two-mode-tracker.js` overwrites mode on non-mode commands | HIGH | Correctness |
| 3 | `AGENTS.template.md` is missing (roadmap v0.2) | HIGH | Docs/Adoption |
| 4 | Astro site is not built in PR CI | MEDIUM | CI |
| 5 | Lexis-Core docs (roadmap v0.4) are missing | MEDIUM | Direction/Docs |

## Plans

- [001 — Add lint and typecheck scripts](./001-add-lint-and-typecheck.md)
- [002 — Fix mode tracker default-mode behavior](./002-fix-mode-tracker-default-behavior.md)
- [003 — Add AGENTS.template.md](./003-add-agents-template.md)
- [004 — Build Astro site in CI](./004-build-site-in-ci.md)
- [005 — Lexis-Core public orchestrator docs](./005-lexis-core-docs.md)

## Already delivered in this branch

- `/guide` and `/es/guide` pages with HowTo schema and per-page meta.
- OpenCode plugin `command.execute.before` hook restored.
- Spanish accents fixed.
- Release notes corrected/created (`v1.2.2.md`, `v1.2.3.md`) and CHANGELOG updated.
- README CI checkbox ticked and guide link added.

## How to use these plans

Pick a plan, run its verification command, then have an executor implement it. Each plan includes acceptance criteria and risks.
