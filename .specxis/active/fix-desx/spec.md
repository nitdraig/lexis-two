# Spec: fix-desx

> Status: done

## Requirements

### MUST (non-negotiable)
- [x] `--json` and a new `--dry-run` print results and write nothing.
- [x] An unknown flag, a flag missing its value, or a `--cwd` that does not exist exits non-zero with a message and writes nothing. `--out` outside `--cwd` is rejected unless it is an absolute path.
- [x] `--git` selects tracked-modified and untracked UI files (`git ls-files -z --modified --others --exclude-standard`), resolved against `git rev-parse --show-toplevel`, so it works from a subdirectory and in a repo with no commits.
- [x] `--git` with no changed UI files scans nothing and says so. It never falls back to a full scan silently, and it marks as resolved only findings in files it scanned.
- [x] Nesting is reported only when the inner card is inside the outer one (tag depth tracked), and the class match is on class tokens, not substrings.
- [x] The `states` check does not fire when a scanned stylesheet styles `:disabled` or `[disabled]` for that class, and ignores dynamic bindings such as `disabled={x}`.
- [x] Contrast pairs a `color` with a `background` in the same rule, in source order; an id or attribute selector such as `#add {` or `a[href="#abc"]` is never read as a color; the same pair is reported once.
- [x] Scale checks skip `calc()` expressions, values under 2px (for example `sr-only`) and pill radii (`9999px`, `50%`).
- [x] A finding keeps its identity when lines above it move: re-running after an unrelated edit leaves the pending list unchanged and adds nothing to Resueltos.
- [x] The report discloses coverage per category: sampled and skipped counts, and "no data" (not "no issues") when a category had too few samples or the file type is not covered (Tailwind, CSS-in-JS).
- [x] The parser reads reports written by 1.4.0 (Spanish headings, em dash).

### SHOULD (strong preference, can deviate with // lexis: comment)
- [x] `--fail-on P0` exits 1 when P0 findings exist. Default stays 0.
- [x] The report is written in English; the skill keeps the existing report's language when it is not English.
- [x] A small ignore list (`node_modules`, `dist`, generated and fixture folders) plus `.gitignore` for the full scan.
- [x] `lineAt` computed from precomputed line starts.
- [x] `skills/desx/SKILL.md` no longer recommends `--json` as a way to "see raw findings before editing" without saying it does not write.

### MAY (optional, implement only if trivial)
- [ ] Parse `hsl()` and named colors.

## Constraints
- Language: plain JS, CommonJS, no new dependency.
- Data safety: the Resueltos section stays append-only; user-ticked boxes are never un-ticked.
- Security: `git` through `spawnSync` with fixed arguments, no shell.

## Acceptance Criteria
- [x] Each repro from the audit is a test: `--json` writes nothing, untracked file scanned, subdirectory run, sibling cards not reported, `:disabled` styled button not reported, `#abc` in an attribute selector not a color, `calc(100% - 13px)` / `-1px` / `9999px` not reported, nonexistent `--cwd` fails, line-shift leaves the report unchanged.
- [x] Running the new detector on this repo's tracked files gives a report whose nesting findings are all nested, checked by hand and recorded in `tasks.md`.
- [x] A report written by 1.4.0 merges without loss.
- [x] `npm test` passes and `node scripts/check-rule-copies.js` passes.
