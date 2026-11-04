# Tasks: fix-desx

> Grouped by concern, each with its own tests in `tests/desx-audit.test.js`. Do not start until agreed.

## Tasks

- [x] task-001: CLI and output safety - `parseArgs`, `main`, `runDesxAudit`. Validation of flags and values, `--cwd` must exist, `--out` inside `--cwd`, `--json` and `--dry-run` write nothing, `--fail-on P0`. Tests through `spawnSync` (D1, D8, D9 part).
- [x] task-002: File selection - `gitTouched`, `walk`. Modified plus untracked via `git ls-files -z`, repo-root resolution, no commits, explicit "no changed UI files", no silent fallback, resolution limited to scanned files, ignore list and `.gitignore` (D2, D11).
- [x] task-003: Contrast and scale detectors - `extractColors`, `scanFile`, `scaleOutliers`. Same-rule color and background pairing in source order, selectors never colors, dedupe, `calc()`, under 2px and pill exceptions (D6, D7).
- [x] task-004: Nesting and states detectors - `scanFile`. Tag depth for nesting, class tokens, stylesheet-aware `:disabled`, ignore dynamic bindings (D3, D4).
- [x] task-005: Report, identity and coverage - `renderAuditMarkdown`, `parseExistingAudit`. Stable identity independent of line, English headings, parser tolerant of both languages and of `-` versus the em dash, per-category coverage with "no data". Update `templates/desx/DESIGN-AUDIT.md` and `skills/desx-apply/SKILL.md:15` (D5, D9, D10).
- [x] task-006: Skill and docs - `skills/desx/SKILL.md`, `.cursor/skills/desx*/SKILL.md`, `docs/desx.md`, `DESX.md`, `CHANGELOG.md`. Run `check-rule-copies.js`. Regenerate or delete `docs/DESIGN-AUDIT.md` per the open question, and record the by-hand check of this repo's report.

## Implementation Notes
- Order: 001 and 002 first (they remove the data-safety and wrong-scope problems), 003 and 004 independent of each other, 005 after them because identity depends on the final description strings.
- Fixtures for the repros live under `tests/fixtures/desx/` and are built into a temp git repo for the `--git` cases. The global commit hook needs `git add` and `git commit` as separate commands; set up fixtures without committing where `--git` does not need history.
- `fix-audit-scripts` is superseded by this spec and `fix-specx`; do not implement it.
- Pairing nearby colors as foreground and background without a parser stays a known ceiling. Name it in a `// lexis:` comment.
- Check results (task-006):
  - `tests/desx-audit.test.js` grew from 4 to 21 tests; each audit repro is one of them (`--json` and `--dry-run` write nothing, bad input exits 2, untracked and staged files scanned, subdirectory run, no-commit repo, unscanned findings kept, sibling cards, `:disabled` styled and dynamic buttons, selector `#abc` not a color, one contrast finding per pair, `calc()`/`-1px`/`9999px` ignored, "no data", line-shift stable, 1.4.0 report merge).
  - Full suite: 111 + 9 tests pass; `check-rule-copies.js` and `claude plugin validate .` pass.
  - By hand on this repo (dry run, 11 UI files): the 1.4.0 detector's nesting findings (`problem-card` inside `problem-grid`, `agent-card` rows in `site/public/redesing/*.html`) were siblings or substring matches and are gone; 0 nesting, 0 contrast findings remain. 9 type-hierarchy findings remain; the h2 to h4 skip at `lexis-redesign.html:353` was confirmed in the source. Spacing (469 samples) and radius (101) reported nothing.
  - Not done: `hsl()` and named colors (MAY). `docs/DESIGN-AUDIT.md` (a stale 1.4.0 artifact I generated earlier) was not deleted: the delete command is blocked by a permission rule here, so it stays for the maintainer to remove.
  - Behavior change to know: the report is now English and finding lines end with `<!-- desx:id -->`; 1.4.0 reports are still read.

## Lexis Tags Added
