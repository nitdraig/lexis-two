# Spec: fix-audit-scripts

> Status: superseded
>
> Replaced by [fix-specx](../fix-specx/spec.md) (debt script) and [fix-desx](../fix-desx/spec.md) (desx audit), one spec per skill. Do not implement this file; it stays only as the record of what was merged.

## Requirements

### MUST (non-negotiable)
- [ ] `specxis-debt` keeps content outside its managed block, including entries appended by `/specxis close`.
- [ ] `specxis-debt` keeps `[x]` for an unchanged comment even when its line number moves.
- [ ] An existing `debt.md` with no managed block loses nothing on first sync.
- [ ] Classifier keywords match whole words: "paint" and "code block" are not Immediate.
- [ ] `specxis-debt` survives broken symlinks and unreadable files.
- [ ] `specxis-debt` can be imported without running.
- [ ] Contrast compares colors in source order; distance is never negative.
- [ ] A CSS id selector such as `#add {` is not read as a color.
- [ ] `--git` marks as resolved only findings in files it scanned.
- [ ] `--git` with no changed files scans nothing and says so.
- [ ] `--git` paths resolve correctly when `--cwd` is a subdirectory.
- [ ] `--cwd` or `--out` without a value exits non-zero and writes nothing.

### SHOULD (strong preference, can deviate with // lexis: comment)
- [ ] A `--fail-on-p0` flag exits non-zero when P0 findings exist. Default stays 0.
- [ ] The report is in English; the parser still reads existing Spanish headings.

### MAY (optional, implement only if trivial)
- [ ] Skip `.next`, `coverage`, `out` in the debt scan.

## Constraints
- Language: plain JS. No new dependencies.
- Data safety: never write `debt.md` unless the scan finished.

## Acceptance Criteria
- [ ] Each repro from the review now gives the correct result, as a test.
- [ ] `npm test` passes with the new `tests/specxis-debt.test.js`.
