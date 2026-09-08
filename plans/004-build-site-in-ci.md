# 004 — Build Astro site in CI

## Context

`.github/workflows/deploy-site.yml` only builds the site after a merge to `main` (or manual dispatch). `.github/workflows/test.yml` never builds the Astro site, so a broken Astro change can pass CI and break the deployed site.

## Goal

Add a site build check to the PR/push CI workflow so site breakages are caught before merge.

## Approach

1. In `.github/workflows/test.yml`, add a `site` job independent of the `test` job:
   - `actions/checkout@v4`
   - `actions/setup-node@v4` with `node-version: '22'` and `cache-dependency-path: site/package-lock.json`
   - `working-directory: site`, run `npm ci`
   - `working-directory: site`, run `npm run build`
2. Keep the root `test` job unchanged so root test failures and site failures are reported separately.

## Acceptance criteria

- CI fails if `site/` cannot build.
- No changes to site runtime behavior.

## Verification

Open a PR that introduces an Astro syntax error; the `site` CI job must fail.

## Risks

- Adds roughly 1–2 minutes to CI. npm caching keeps subsequent runs cheap.
