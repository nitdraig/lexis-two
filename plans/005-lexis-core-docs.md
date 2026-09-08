# 005 — Lexis-Core public orchestrator docs (v0.4)

## Context

README roadmap v0.4 is entirely unchecked. The project promises "Lexis-Core as a reference agent" and guides for building a private Lexis-One on top of Lexis-Two, but no public documentation exists yet.

## Goal

Write `docs/core.md` that documents the multi-agent role architecture without exposing private config, and ship a placeholder `opencode.json` template.

## Approach

1. Create `docs/core.md` covering:
   - The agent roles already listed in `AGENTS.md` (lexis-one, lexis-review, ui-architect, refactor-agent, security-auditor, explorer).
   - How the roles coordinate around a shared `AGENTS.md` and `skills/` catalog.
   - The difference between Lexis-Two (public portable rules), Lexis-One (private orchestration), and Lexis-Core (future reference orchestrator).
   - A practical guide: "How to build your own private Lexis-One" — fork Lexis-Two, add private instructions, keep adapters thin.
   - When to add or remove an agent (YAGNI reminder).
2. Create `templates/opencode.json` with a placeholder multi-agent ecosystem configuration. Use placeholder values like `"YOUR_MODEL_PROVIDER"` and `"path/to/private/instructions.md"`; no real API keys or private prompts.
3. Update README roadmap v0.4 checkboxes to `[x]` for completed items.
4. Link to `docs/core.md` from the README Ecosystem section.

## Acceptance criteria

- `docs/core.md` renders correctly and contains no private configuration.
- `templates/opencode.json` is valid JSON with clearly marked placeholders.
- README roadmap v0.4 reflects progress.
- `npm test` and `node scripts/check-rule-copies.js` still pass.

## Verification

```bash
npm test
node scripts/check-rule-copies.js
```

## Risks

- Medium effort; content must stay generic to avoid leaking private prompts or provider configurations.
