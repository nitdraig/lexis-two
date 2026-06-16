# Site — lexis-two.excelso.xyz

Astro static site in `site/`. Deployed to GitHub Pages via `.github/workflows/deploy-site.yml`.

**Primary goal:** showcase the project and drive clones/stars.  
**Secondary goal:** publish benchmark charts at `/benchmarks/`.

## Local dev

```bash
npm run site:dev
# → http://localhost:4321

# After a benchmark run:
npm run benchmark:report   # syncs JSON → site/src/data/
npm run site:build
```

## Hosting

GitHub Pages + custom domain `lexis-two.excelso.xyz`.

| Piece | Location |
| ----- | -------- |
| Astro app | `site/` |
| Build output | `site/dist/` |
| CNAME | `site/public/CNAME` |
| CI deploy | `.github/workflows/deploy-site.yml` (push to `main` under `site/**`) |

DNS: CNAME `lexis-two` → `<user>.github.io`.

## Content map

| Section | Source |
| ------- | ------ |
| Hero + benchmarks CTA | `site/src/components/Home.astro` + i18n |
| Philosophy ladder | `site/src/i18n/*.ts` |
| Hosts / commands / install | i18n dictionaries |
| Benchmark charts | `site/src/pages/benchmarks.astro` + `site/src/data/opencode-go-benchmark.json` |
| Portability docs | `docs/portability.md` on GitHub (linked, not duplicated) |

## Checklist

- [x] Astro site in `site/`
- [x] `site/public/CNAME` → `lexis-two.excelso.xyz`
- [x] Benchmark page at `/benchmarks/`
- [ ] GitHub Pages enabled (Settings → Pages → deploy from Actions / gh-pages branch)
- [ ] DNS CNAME live; HTTPS green

## Legacy

`docs/index.html` and `docs/styles.css` were removed — use `site/` instead. `docs/portability.md` stays in repo for GitHub linking.
