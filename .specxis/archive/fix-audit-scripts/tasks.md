# Tasks: fix-audit-scripts

> Each task maps to one function, with its test. Do not start until agreed.

## Tasks

- [ ] task-001: `specxis-debt.js` - add a `require.main` guard and exports; create `tests/specxis-debt.test.js` (M3a).
- [ ] task-002: `syncDebt` - write only inside `<!-- lexis-debt:start/end -->`, keep the rest and `[x]` state keyed by file plus comment text; remove `debtContent` (B10, S14).
- [ ] task-003: Classifier in `syncDebt` - use `\b` regexes (B10).
- [ ] task-004: `scanDir` - use `withFileTypes`, skip symlinks, catch per-file read errors (B10).
- [ ] task-005: `extractColors` (`desx-audit.js:84`) - sort by index (B17).
- [ ] task-006: `HEX` handling - ignore matches followed by `{` or `,`, or inside `href` and selectors (B18).
- [ ] task-007: `runDesxAudit` and `renderAuditMarkdown` - pass scanned files, resolve only within them, no full-scan fallback, `git diff --relative` (B16).
- [ ] task-008: `parseArgs` and `main` - validate values, wrap errors, add `--fail-on-p0` (B12, M7).
- [ ] task-009: `renderAuditMarkdown` and `parseExistingAudit` - English output, parse both heading languages (M7). Update `skills/desx-apply/SKILL.md:15` and `templates/desx/DESIGN-AUDIT.md`.
- [ ] task-010: `tests/desx-audit.test.js` - cover tasks 005-009.

## Implementation Notes
- Keep the existing Spanish file readable: pre-marker content in `debt.md` stays above the managed block.
- Pairing any two nearby colors as foreground and background stays a known ceiling. Add a `// lexis:` comment naming it.

## Lexis Tags Added
