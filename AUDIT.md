# Audit Report — lexis-two v1.0.0

**Date:** 2026-06-16
**Scope:** Full project (repo root, hooks, commands, skills, plugins, site, tests, docs)
**Method:** Parallel audit across 3 agents (root+tests, hooks+commands+skills+plugins, docs+examples+assets)

---

## HIGH

| # | File | Issue |
|---|------|-------|
| 1 | `package.json` | **Version mismatch.** Root said `0.1.0`, plugin manifests said `4.6.0` (Ponytail legacy). Unified to `1.0.0` across all manifests. |
| 2 | `README.md:188-219` | **Roadmap desync.** v0.3 items unchecked but files exist: `pi-extension/`, `examples/`, `.claude-plugin/`, `.codex-plugin/`, `.github/plugin/`. Checkboxes should reflect reality. |
| 3 | `hooks/copilot-hooks.json` | **Missing node availability check.** Unlike `hooks.json` (Claude Code) which wraps node calls in `command -v node ... || exit 0`, Copilot hooks run `node` directly. Crashes if node is absent instead of degrading. |
| 4 | `.codex-plugin/plugin.json:13,28-29` | **Broken relative paths.** `"skills": "./skills/"` and `"logo": "./assets/logo.png"` resolve inside `.codex-plugin/` (nonexistent). Should be `../skills/` and `../assets/logo.png`. |

## MEDIUM

| # | File | Issue |
|---|------|-------|
| 5 | `tests/hooks.test.js` | **No `node:test` blocks.** Runs assertions as top-level code. First failure stops the rest. Inconsistent with all other test files. |
| 6 | `tests/hooks.test.js:3` | **`require('assert')` instead of `require('node:assert/strict')`.** Loose comparison could mask type coercion bugs. |
| 7 | `tests/hooks.test.js:21` | **Mutates `process.env` globally** without restore. Fragile if Node parallelizes test files. |
| 8 | `commands/lexis-two.toml` | **Missing `name` field.** All other 6 TOML commands have `name`. This one only has `description` + `prompt`. |
| 9 | `hooks/lexis-two-instructions.js:75` + `lexis-two-config.js:32` | **`normalizePersistedMode` duplicated.** Same function name, different implementations. Risk of silent divergence. |
| 10 | `docs/portability.md:6` | **Stale reference.** Says "static landing in `docs/`" but site source is in `site/`. |
| 11 | `examples/` | **Stack mismatch with roadmap.** README promises Next.js, Express, MongoDB, PostgreSQL examples. Actual: Python/FastAPI + JS vanilla. |
| 12 | `tests/gemini-extension.test.js:26` | **Hardcoded command subset.** Only validates 2 of 7 command files. Other tests cover more. |

## LOW

| # | File | Issue |
|---|------|-------|
| 13 | `.github/workflows/test.yml` | No npm dependency caching (deploy.yml has it). |
| 14 | `.github/workflows/test.yml:23` | `pip install pandas` without version pin. |
| 15 | `.github/workflows/test.yml` vs `deploy-site.yml` | `node-version` quoting inconsistent (string vs integer). |
| 16 | `hooks/lexis-two-config.js:1` | Shebang on module that is only `require()`'d, never run directly. |
| 17 | `plugins/` and `modes/` | Empty directories, unreferenced anywhere. |
| 18 | `assets/lexis-two-complete.webp` + `social-preview.png` | Unreferenced files. |
| 19 | `README.md:22` | Subtitle says "Lexis-Two-specific runs pending" but benchmarks exist. |
| 20 | `README.md:160` | `my-skills` in README vs `my-cursor-skills` in marketplace.json. |
| 21 | `scripts/check-rule-copies.js` | No unit test for the script itself. |

---

## Verified OK

- 36 root tests + 2 pi-extension tests pass
- Site build: 4 pages, sitemap + robots.txt generated
- Chart.js lazy-loaded via IntersectionObserver
- Structured data (JSON-LD) in Layout
- Skip link i18n working
- License MIT correct (includes Ponytail attribution)
- `.env` not tracked in git
- No hardcoded secrets
- Hooks degrade gracefully (except copilot-hooks.json — HIGH #3)
- `check-rule-copies.js` validates 5 rule copies match AGENTS.md
- `focus-visible` styles present
- `--text-muted` contrast passes WCAG AA (5.2:1)

---

## Actions Taken in This Session

1. **Version unified to `1.0.0`** across `package.json`, `gemini-extension.json`, `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, `.github/plugin/plugin.json`, `site/package.json`.
2. **`.codex-plugin` paths fixed** — `skills` and asset references point to `../`.
3. **Test updated** — `gemini-extension.test.js` now also validates `package.json` version consistency.
4. **Spanish translation fixed** — tildes, interrogaciones de apertura, skip link i18n, "Copied" feedback.
5. **Accessibility** — `focus-visible` global, `--text-muted` contrast, heading hierarchy.
6. **Dead code removed** — `BenchmarkPage.astro` deleted (253 lines).
7. **Chart.js lazy-loaded** — IntersectionObserver on `#benchmarks`, 200KB off main thread.
8. **SEO** — `@astrojs/sitemap`, `robots.txt`, JSON-LD `SoftwareApplication`, `meta robots` + `author`.
9. **Language switcher** — Pill button with globe SVG icon, aria-labels, scoped CSS.
