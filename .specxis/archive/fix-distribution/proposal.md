# Proposal: fix-distribution

## Goal
Every documented install channel loads correctly, and a green test run means the channel actually works.

## Lazy Check
- Does this need to exist? Yes. These are broken manifests, a no-op postinstall and instructions pointing at unpublished files.
- Does stdlib, the framework, or an installed dep already cover it? `claude plugin validate` and `npm pack --json` give the verification; no new dependency.
- What is the absolute minimum? Correct the paths, publish the referenced manifests, fix the frontmatter, stop forcing a language, and add one config value for it. The existing config resolver and the shared instruction builder already reach every hook-based host.

## Discovery source
- Path: N/A (bug fixes)

## Context
- Affected: `.claude-plugin/`, `scripts/opencode-wrapper-postinstall.mjs`, `tests/opencode-postinstall.test.js`, `skills/`, `AGENTS.md` and its rule copies, `package.json`.
- Findings: F1-F6 in [improvement-plan.md](../../improvement-plan.md).

## Out of Scope (YAGNI)
- Reworking how rule copies are produced (simplify-codebase 008).
- Plugin validation in CI (ci-and-housekeeping 002).
- Translating skills or templates.
- A `/lexis language` command: the env var and the config file are enough.

## Decisions
- D1: the package does not force a language, and it must be configurable. Hook-based hosts read `LEXIS_TWO_LANGUAGE` or `language` in the config file. Static hosts (Cursor, Windsurf, Cline, Kiro) run no code, so they get a documented one-line addition to their rule file.

## Open Questions
- Does declaring `./hooks/hooks.json` conflict with Claude Code's automatic loading of that path? Task 003 settles it with a real load.
