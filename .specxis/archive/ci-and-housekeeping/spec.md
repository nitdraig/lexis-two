# Spec: ci-and-housekeeping

> Status: done

## Requirements

### MUST (non-negotiable)
- [x] `npm run lint` checks the syntax of every JS and MJS source file and fails on any broken one.
- [x] CI runs lint and tests on Ubuntu and Windows.
- [x] CI fails if `site/` cannot build.
- [x] `test.yml` declares least-privilege `permissions`.
- [x] `pi-extension/package.json` is published, so `index.js` keeps its ESM scope after install.
- [x] `site/public/redesing/` is removed from the published site.

### SHOULD (strong preference, can deviate with // lexis: comment)
- [x] CI runs plugin manifest validation.
- [x] `package.json` declares `repository`, `homepage`, `bugs`, `engines`.
- [x] OpenCode's local-model skip is logged and documented.
- [x] (D4) `plans/` is deleted.
- [x] (moved to fix-specx) `specxis-init` no longer edits `.gitignore` and names current commands.

### MAY (optional, implement only if trivial)
- [x] Remove the root `CNAME` and `.nojekyll` if the Pages deploy from `site/` does not use them.

## Constraints
- Security: no secrets added to CI.
- Language: plain JS. No new dependencies.

## Acceptance Criteria
- [x] A deliberately broken non-first file makes `npm run lint` fail.
- [ ] CI is green on both operating systems on a PR.
- [x] `npm pack --dry-run` lists `pi-extension/package.json`.

## Waivers

- 2026-11-04 (user): closed with "CI is green on both operating systems on a PR" unchecked. It needs a real push or PR; the workflow matrix (ubuntu, windows) is in place and the suite passes locally on Windows.
