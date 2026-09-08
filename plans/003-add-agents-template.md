# 003 — Add AGENTS.template.md

## Context

The README roadmap marks v0.2 item `AGENTS.template.md` as not done. Teams adopting Lexis-Two have no starting template for a project-level `AGENTS.md`, so every project reinvents the structure.

## Goal

Create a commented, minimal `AGENTS.template.md` that teams can copy into a new repo and fill section by section.

## Approach

1. Create `AGENTS.template.md` at repo root with the following sections, each containing fill-in prompts:
   - Project context (name, team, repo URL, purpose)
   - Stack (language, framework, database, cache, styling, data fetching)
   - Design tokens / UI conventions
   - Code conventions (naming, TypeScript rules, error handling, logging)
   - Security non-negotiables
   - Testing expectations
   - Deployment / infra notes
   - Glossary
   - How to update this file
2. Keep prompts as HTML comments (`<!-- fill: ... -->`) so the file is valid Markdown before edits.
3. Tick the `AGENTS.template.md` checkbox in the README roadmap v0.2 section.
4. Mention the template in `docs/setup.md` under the install instructions.

## Acceptance criteria

- `AGENTS.template.md` exists and renders as valid Markdown.
- README roadmap checkbox is `[x]`.
- `node scripts/check-rule-copies.js` still passes (the template is not a rule copy).

## Verification

```bash
node scripts/check-rule-copies.js
```

## Risks

- Low risk; documentation-only change.
