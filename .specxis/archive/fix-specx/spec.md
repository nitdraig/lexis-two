# Spec: fix-specx

> Status: done

## Requirements

### MUST (non-negotiable)
- [x] `plan` writes `> Status: draft` in `spec.md`. After the user approves the plan, the skill writes `agreed`. The first `implement` writes `implementing`. `close` writes `done` before archiving.
- [x] `implement` refuses and says why unless the status is `agreed` or `implementing`.
- [ ] The first `implement` records the base commit (`git rev-parse HEAD`, or the literal `none` in a repo with no commits) in `tasks.md`. `review` and `close` diff against that base, not against `HEAD`, so checkpoint commits do not empty the diff.
- [ ] `review.md` lists findings as checkboxes with a severity. `close` refuses while an unchecked Critical or High finding exists.
- [ ] `close` requires `review.md`, or a one-line waiver written into the spec by the user. A criterion that cannot be verified is closed only through an explicit waiver line, never silently.
- [x] `specxis-debt` writes only between `<!-- lexis-debt:start -->` and `<!-- lexis-debt:end -->`, keeps all other content, and keeps `[x]` for an unchanged comment even when its line moves.
- [x] An existing `debt.md` with no managed block loses nothing on the first sync.
- [x] `specxis-debt` classifies on whole words, survives broken symlinks and unreadable files, writes `debt.md` only after the scan finishes, and can be imported without running.
- [x] `specxis-init` no longer edits `.gitignore`, can be imported without running, and prints current command names.
- [x] Templates carry no stack-specific constraint. The constraints block is filled from the stack profile in `stacks/` when one applies.
- [x] Template and doc text uses current command names (`/specx plan`, `/specx close`, `/specx debt`), not `/specxis-plan`, `/specxis-new`, `/specxis-close`, `/specxis-debt`.
- [x] `new <slug>` rejects slugs that do not match `^[a-z0-9]+(-[a-z0-9]+)*$`, and `close` refuses to overwrite an existing `.specxis/archive/<slug>`.

### SHOULD (strong preference, can deviate with // lexis: comment)
- [x] The task rule reads "one concern per task, tests inside it; split when it spans more than one" in `SPECXIS.md`, `docs/specxis.md`, the README line, the skill and the template. The cap of 10 stays.
- [ ] Re-running `plan` on a spec that already has checked tasks keeps them and asks before dropping any.
- [x] The Discovery gate lists its trigger words in English and Spanish and says so, so the behavior does not depend on the response language.
- [ ] `status` shows the base commit and whether `review.md` has open High findings.

### MAY (optional, implement only if trivial)
- [x] Skip `.next`, `coverage`, `out` in the debt scan.

## Constraints
- Language: plain JS for scripts, no new dependency. Skill and docs in English.
- Data safety: never rewrite a file the user edited without keeping its content.
- Security: `git` is called with fixed arguments through `spawnSync`, no shell.

## Acceptance Criteria
- [ ] A scripted walk-through in a scratch project (new, plan, approve, implement one task, commit, review, close) leaves the status lines correct at every step and a non-empty review diff after the commit. Recorded in `tasks.md`.
- [ ] `implement` on a `draft` spec is refused in the walk-through.
- [x] Tests reproduce each audit repro for the debt script: hand-written notes kept, ticked entry kept after a line move, `not a blocker` and `painless` not Immediate, broken symlink survived.
- [x] `specxis-init` run twice changes nothing the second time and leaves `.gitignore` untouched.
- [x] `npm test` passes and `node scripts/check-rule-copies.js` passes.
- [x] `claude plugin validate .` still passes.

## Waivers

- 2026-11-04 (user): closed with the unchecked criteria above. They describe skill behavior that can only be confirmed in a live agent session; the code, scripts and tests are done. Not verified in a real host.
