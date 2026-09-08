# 001 — Add lint and typecheck scripts

## Context

`AGENTS.md` states the pre-commit rule: *"Run `npm run lint`"*. The root `package.json` has no `lint` script, and the Astro site has no `typecheck` script. This gap means the stated convention is unenforceable and CI cannot catch JS syntax or site type errors before merge.

## Goal

Add a minimal `lint` script that validates JS syntax across root scripts/hooks/tests and typechecks the Astro site, without adding new dependencies. Wire it into CI.

## Approach

1. Add to root `package.json`:
   ```json
   "lint": "node --check bin/*.js scripts/*.js hooks/*.js tests/*.test.js pi-extension/index.js && npm run typecheck --prefix site"
   ```
2. Add to `site/package.json`:
   ```json
   "typecheck": "tsc --noEmit"
   ```
3. Confirm `site/tsconfig.json` already sets `noEmit: true`.
4. Run `npm run lint` and fix any syntax errors surfaced by `node --check`.
5. Add a `lint` job to `.github/workflows/test.yml` (parallel to the `test` job) that runs `npm run lint`.

## Acceptance criteria

- `npm run lint` exits 0 locally.
- CI runs the lint job on every push and pull request.
- No runtime behavior changes.

## Verification

```bash
npm run lint
```

## Risks

- `node --check` only catches syntax, not style. If the team wants style linting, upgrade to ESLint in a follow-up plan.
- Shell glob expansion in `package.json` scripts is portable across npm/Unix but verify on Windows; prefer explicit file lists if globs fail.
