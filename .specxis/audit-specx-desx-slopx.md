# Audit: specx, desx, slopx (draft spec)

Date: 2026-11-04. Version audited: `@draig/lexis-two` 1.4.0 plus the `slopx` draft in `.specxis/active/slopx/`.

Method: read `skills/specxis`, `scripts/specxis-*.js`, `templates/specxis/`, `SPECXIS.md`, `docs/specxis.md`, `skills/desx*`, `scripts/desx-audit.js`, `docs/desx.md`, `tests/desx-audit.test.js` and the slopx spec. Behavior claims marked **verified** were reproduced with fixtures in a scratch repo outside this repo (`$scratchpad/p2`, `p3`, `p4`); everything else is read from code and marked **read**.

Not covered: real runs of the skills inside a host agent (the model-driven parts of specx and desx), `desx-apply` behavior, hosts other than Claude Code.

Severity: High = wrong results or data loss in normal use; Medium = wrong in common cases or misleading; Low = polish.

---

## Specx

| ID | Sev | Finding | Evidence | Fix |
|----|-----|---------|----------|-----|
| X1 | High | Nothing ever writes `Status:` in `spec.md`. `status` reads draft/agreed/implementing/done, but `plan`, `implement`, `close` never set it. | read: `skills/specxis/SKILL.md` sections 1-6. In this audit's own specs the status was edited by hand. | `plan` writes `draft`; an explicit approval step writes `agreed`; first `implement` writes `implementing`; `close` writes `done`. |
| X2 | High | `implement` has no approval gate. `plan` says "ask for approval" but `implement` only looks for the first unchecked task. | read: sections 3-4. | `implement` refuses unless `Status: agreed` or `implementing`. |
| X3 | High | `review` and `close` rely on `git diff HEAD` and "comments added during this feature" with no recorded base. After a `checkpoint:` commit the diff is empty. In a repo with no commits `git diff HEAD` fails. | read: sections 5-6. verified: `fatal: ambiguous argument 'HEAD'` on a fresh repo. | Record the base commit in `tasks.md` at the first `implement`; diff against it. |
| X4 | High | `specxis-debt.js` overwrites `debt.md` entirely. Hand-written notes and ticked items are lost; the classifier matches substrings. | verified: notes and a ticked `[x]` entry gone after one run; `// lexis: native <blockquote> styling, not a blocker` and `painless migration` both filed under Immediate. | Merge instead of overwrite; classify on a leading tag (`immediate:`), not substrings. Already tracked as B10 in `fix-audit-scripts`. |
| X5 | Medium | `close` requires "no Critical/High findings open" but `review.md` has no open/closed marker, and `close` does not require a review to exist. | read: `templates/specxis/review.md`, section 6. | Findings as checkboxes in the review template; `close` counts unchecked High/Critical. |
| X6 | Medium | "One file or function per task" inflates specs and stop-and-report cycles; the cap is 10 with no minimum. There is no way to amend a spec when scope changes mid-implementation. | read: `SPECXIS.md` "Rule of 10". | One concern per task, tests inside it. Add `/specx amend`, or document that `plan` can be re-run. |
| X7 | Medium | Templates are stack-bound and stale. `spec.md` hardcodes "TypeScript: strict" in a JS-first repo; `tasks.md` and `specxis-init` name `/specxis-plan`, `/specxis-new`; `specxis-init` appends two commented lines to `.gitignore` that do nothing. | read: `templates/specxis/*`, `scripts/specxis-init.js:34-45`. | Drop the `.gitignore` edit; read constraints from the stack profile; current command names. Tracked as M3b/M8b. |
| X8 | Low | Discovery gate keyword list is Spanish inside an English skill (`quiero una`, `plataforma`, `sin discovery`). Inconsistent with the language setting (fix-distribution D1). | read: `SKILL.md:21`. | Keep both languages but say so, or make it model judgment only. |
| X9 | Low | No tests for `specxis-debt.js` or `specxis-init.js`; both run on import (no `require.main` guard), so they cannot be tested in-process. `specxis-debt` scans the process cwd, not the project root. | read. | Guard + export; tracked as M3a/M3b. |
| X10 | Low | `new <slug>` and `close` do not validate the slug or an existing archive folder; the skill only asks for kebab-case. | read. | Validate `^[a-z0-9-]+$`; refuse to overwrite `archive/<slug>`. |

Solid: lazy check before any spec; soft Discovery gate that never blocks; one task per run; `// lexis:` capture into debt.

---

## Desx

| ID | Sev | Finding | Evidence | Fix |
|----|-----|---------|----------|-----|
| D1 | High | `--json` still writes and merges `DESIGN-AUDIT.md`. The skill recommends `--json` "if you need raw findings before editing". | verified: `DESIGN-AUDIT.md` created by a `--json` run. | `--json` implies no write (`dryRun` already exists in `runDesxAudit`); add a `--dry-run` flag. |
| D2 | High | `--git` misses untracked files, which are where new UI lives. From a subdirectory the repo-root-relative paths are joined to `cwd` and nothing matches. It then falls back to a full scan silently. | verified: untracked `brandnew.html` (h1 to h4 skip) not reported; run from `sub/` reports 0 findings, no warning. | `git ls-files -z --modified --others --exclude-standard`, resolved with `git rev-parse --show-toplevel`; say when the fallback happens. Tracked partly as B16. |
| D3 | High | Nesting detector flags siblings. The regex matches two cards within 400 characters without tracking closing tags; class match is a substring (`discard`, `cardinal`). | verified: two sibling `<div class="card">` reported as nested. This repo's own `docs/DESIGN-AUDIT.md` is mostly this finding. | Track tag depth, or require the second opener to appear before the first closer; match class tokens, not substrings. |
| D4 | High | `states` ignores CSS and treats a dynamic `disabled={x}` as a disabled button. | verified: reported with `.btn:disabled { opacity: .5 }` defined in the stylesheet. | Skip when any scanned stylesheet styles `:disabled` or `[disabled]` for that class; ignore dynamic bindings. |
| D5 | High | Finding identity is `file:line`. Any edit above a finding moves it, so it becomes "resolved" and a new unchecked duplicate appears. | verified: inserting two lines moved 3 findings into Resueltos while pending stayed at 9. | Key on file + category + normalized description + occurrence index, or a hash of the line. |
| D6 | Medium | Contrast pairs consecutive colors (B17), parses `#abc` inside `a[href="#abc"]` as a P0 color (B18), reports each pair twice (a to b and b to a), ignores alpha, and does not parse `hsl()`, named colors or `var()`. | verified: P0 for `#fff` vs `#abc` from an attribute selector; two P1 lines for one pair. | Pair `color` with `background` in the same rule; skip selectors; dedupe; document unsupported formats in the coverage line. |
| D7 | Medium | Scale outliers include `calc(100% - 13px)`, `-1px` and `1px` (sr-only), and `9999px` (pill radius). | verified: all three flagged once the file had enough samples. | Skip `calc()`, values under 2px and 9999 or 50%-style pills. |
| D8 | Medium | CLI validation: unknown flags ignored; a nonexistent `--cwd` is created and gets a report with 0 findings and exit 0; `--out` can write outside `cwd`. | verified: all three. | Reject unknown flags; require `cwd` to exist; keep `--out` inside `cwd` unless explicitly absolute. Tracked as B12. |
| D9 | Medium | Exit code is always 0 (M7). Report headings and the merge parser are fixed Spanish (`Hallazgos`, `Resueltos`, `sugerencia`) and the parser requires an em dash, which conflicts with the language setting and breaks merging if the user edits the dash. | read: `desx-audit.js:393-470`. | `--fail-on P0`; headings as constants in one place; parser tolerant of `-` and `—`. |
| D10 | Medium | Coverage gaps are undisclosed. Tailwind and CSS-in-JS get no contrast, spacing or radius coverage; spacing and radius need 8 or more samples or they report nothing. The report says only "Categories evaluated". | read: `scanFile`, `scaleOutliers`. | Print per-category "sampled / skipped" counts; say "no data" instead of "no issues". |
| D11 | Low | `lineAt` re-splits the text per finding (quadratic on large CSS). `walk` scans `site/public/redesing/` and `tests/fixtures/`, so this repo's own report is noise; there is no ignore list. | read; seen in `docs/DESIGN-AUDIT.md`. | Precompute line starts; honor `.gitignore` or a small ignore list. |
| D12 | Low | Only 4 tests: none for the CLI, `--git`, `--json`, `--out`, or line-shift merging. | read: `tests/desx-audit.test.js`. | Add after D1, D2 and D5 land. |

Solid: deterministic and model-free; the Resueltos section is append-only by design; the auditor and the implementer are separate roles; WCAG math is correct (white on black returns 21).

---

## Slopx (draft spec, before any code)

Each item is a gap in `.specxis/active/slopx/spec.md` that would turn into a bug.

| ID | Sev | Gap | Evidence | Amendment |
|----|-----|-----|----------|-----------|
| S1 | High | The debug category would be almost all false positives in CLI projects. `console.log` is the output channel of a CLI. | verified on this repo: 35 `console.log/debug` in 9 files, all CLI scripts. | Convention-aware: flag only when the file (or the repo, outside tests) has no other `console.*` use, or skip files with a shebang or under `bin/` and `scripts/`. |
| S2 | High | Reading untracked files follows symlinks and has no size or binary guard. | read: spec constraint says "untracked files count as fully added". | `lstat` and skip symlinks; skip files over a size cap or containing a NUL byte. |
| S3 | High | `git diff HEAD` fails with no commits; non-ASCII names come back quoted and escaped. | verified: `fatal: ambiguous argument 'HEAD'`; `"\303\261and\303\272.js"` without `-z`. | Diff against the empty tree when `HEAD` is missing; use `-z` for file lists and `-c core.quotepath=false` for hunk headers. |
| S4 | Medium | The skill MUST repeats `/lexis review`: "abstractions with a single caller" is item 2 of `lexis-two-review`. The proposal says slopx does not repeat those checks. | read: `skills/lexis-two-review/SKILL.md`. | Remove it from slopx; keep redundant defensive checks, near-identical blocks, trivial docstrings, and copy. |
| S5 | Medium | The tool would flag its own docs. `docs/slopx.md`, `SKILL.md` and the phrase constant list the very phrases and examples it detects. | read. | Phrase and placeholder checks only in UI and i18n files, not `.md`; `.md` gets the emoji check only, with an exemption marker (`<!-- lexis: ... -->`) accepted on the same line. |
| S6 | Medium | `_old`, `_unused`, `// deprecated` are normal conventions (lint-silencing underscores, `@deprecated` JSDoc). | read; 0 hits in this repo, so the rule is unmeasured. | `_unused`/`_old` and `@deprecated` low confidence or dropped; keep `// removed` and `// previously`. |
| S7 | Medium | "Empty catch" is ambiguous. Intentional one-line empty catches exist. | verified on this repo: 7 one-line empty catches (hooks, config reads). | Flag only an empty body with no comment and no statement; a comment is intent. |
| S8 | Medium | Emoji rule is a house rule, not a universal one. Flags (regional indicators) and brand emoji are legitimate in some apps; generated files carry them. | verified on this repo: 2 files, `README.md` and `benchmarks/results/*.json` (generated). | Skip generated paths (`dist/`, `build/`, `*.min.*`, `*.d.ts`, `benchmarks/results/`); downgrade to low when the repo already has emoji in tracked source. |
| S9 | Medium | Undefined terms: "test files", "UI strings", `--base` semantics. Copy detection has no unit (JSX text vs string literal vs any added line). | read. | Define test globs (`*.test.*`, `*.spec.*`, `__tests__/`, `tests/`, `fixtures/`); phrase checks run on the whole added line of eligible files; `--base <ref>` means diff against `merge-base(ref, HEAD)` plus the working tree. |
| S10 | Low | Output may echo secrets. A debug leftover such as `console.log(token)` is exactly what gets flagged. | read. | Print locator and category only; the skill reads the line itself. No line text in `--json`. |
| S11 | Low | Commented-out code heuristic will hit JSDoc examples and license headers. CRLF (`autocrlf` warnings already seen on this machine) leaves `\r` on lines. | verified: git warns "LF will be replaced by CRLF" in the scratch repo. | Skip comment lines inside `/** */`; strip `\r`. |
| S12 | Low | Calibration step uses `HEAD~20`, which fails in a young repo and mixes merge commits. | read; this repo has 114 commits, so it works here. | `HEAD~min(20, count)`, first-parent only. |
| S13 | Low | `--fail-on` accepts any value; no CLI-level tests (spawn) are listed. | read. | Validate `high`; test through `spawnSync`, like the postinstall test. |
| S14 | Low | The audit scripts' lesson: do not mix write and read. Slopx is stdout-only, which already avoids D1 and D5. | n/a | Keep it that way; state it as a MUST. |

---

## Priorities

1. Data loss and false state: X4 (debt overwrite), X1 and X2 (status never written, no gate), D1 (`--json` writes), D5 (resolved churn).
2. Wrong results: D2, D3, D4 (desx findings you cannot trust), X3 (review against `HEAD`).
3. Amend the slopx spec before its first task: S1, S2, S3, S4, S5.
4. Everything else as listed in `fix-audit-scripts` or a new `fix-specx-lifecycle` spec.

Spec coverage today: X4, X7, X9, D2 (partly), D6, D8, D9 are already in `fix-audit-scripts` or `ci-and-housekeeping`. New and not covered: X1, X2, X3, X5, X6, X8, X10, D1, D3, D4, D5, D7, D10, D11, S1 to S13.
