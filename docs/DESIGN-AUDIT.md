# Design audit

Última corrida: 2026-11-03

## Contexto
- Sistema de diseño detectado: source-level scan (CSS/markup colors, spacing, radii, type). Not a browser computed-style engine.
- Categories evaluated: contrast, spacing, radius, type-hierarchy, nesting, states.
- Coverage: contrast pairs 142; spacing samples 479; radius samples 112; files 13.
- Componentes existentes relevantes: inferred from class tokens card/panel/tile and heading tags when present.

## Hallazgos

### P0 — bloqueante
- [ ] `benchmarks/results/opencode-go-2026-06-16-report.html:10` — Contrast 1.07:1 between #0b0d0c and #121614 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `benchmarks/results/opencode-go-2026-06-16-report.html:11` — Contrast 1.15:1 between #121614 and #1e2420 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `benchmarks/results/opencode-go-2026-06-16-report.html:13` — Contrast 2.63:1 between #e8ece9 and #8a948d (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `benchmarks/results/opencode-go-2026-06-16-report.html:14` — Contrast 1.38:1 between #8a948d and #7cba8a (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `benchmarks/results/opencode-go-2026-06-16-report.html:15` — Contrast 1.41:1 between #7cba8a and #c97a7a (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `benchmarks/results/opencode-go-2026-06-16-report.html:129` — Contrast 1.41:1 between #c97a7a and #7cba8a (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `benchmarks/results/opencode-go-2026-06-16-report.html:173` — Contrast 1.41:1 between #c97a7a and #7cba8a (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `benchmarks/results/opencode-go-2026-06-16-report.html:190` — Contrast 1.48:1 between #7cba8a and #5a9a6a (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `benchmarks/results/opencode-go-2026-06-16-report.html:190` — Contrast 1.99:1 between #5a9a6a and #9fd4a8 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `benchmarks/results/opencode-go-2026-06-16-report.html:190` — Contrast 1.32:1 between #4a7356 and #3d5f48 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-combined.html:13` — Contrast 1.06:1 between #f4f3ef and #fbfaf7 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-combined.html:14` — Contrast 1.15:1 between #fbfaf7 and #eceae4 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-combined.html:20` — Contrast 1.53:1 between #171717 and #383838 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-combined.html:22` — Contrast 1.94:1 between #e8e7e1 and #a9a79f (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-combined.html:32` — Contrast 1.07:1 between #121212 and #191919 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-combined.html:32` — Contrast 1.12:1 between #191919 and #232323 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-combined.html:33` — Contrast 2.56:1 between #f2f1ec and #9a988f (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-combined.html:33` — Contrast 1.46:1 between #333230 and #121212 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-combined.html:37` — Contrast 1.07:1 between #121212 and #191919 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-combined.html:37` — Contrast 1.12:1 between #191919 and #232323 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-combined.html:38` — Contrast 2.56:1 between #f2f1ec and #9a988f (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-combined.html:242` — Contrast 1.59:1 between #55534d and #37352f (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-landing-wireframe.html:10` — Contrast 1.06:1 between #f4f3ef and #fbfaf7 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-landing-wireframe.html:11` — Contrast 1.15:1 between #fbfaf7 and #eceae4 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-landing-wireframe.html:620` — Contrast 1.00:1 between #383838 and #383838 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-landing-wireframe.html:787` — Contrast 1.59:1 between #55534d and #37352f (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-landing-wireframe.html:934` — Contrast 1.79:1 between #383838 and rgba(0,0,0,.07) (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-redesign.html:12` — Contrast 1.07:1 between #0c1016 and #12181f (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-redesign.html:13` — Contrast 1.09:1 between #12181f and #182029 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-redesign.html:14` — Contrast 1.26:1 between #182029 and #28323d (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-redesign.html:16` — Contrast 2.35:1 between #eef1f4 and #93a0ad (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-redesign.html:17` — Contrast 1.54:1 between #93a0ad and #5fd8c9 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-redesign.html:29` — Contrast 1.09:1 between #f7f5f1 and #ffffff (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-redesign.html:29` — Contrast 1.16:1 between #ffffff and #f0eee9 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-redesign.html:29` — Contrast 1.22:1 between #f0eee9 and #ddd8ce (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-redesign.html:30` — Contrast 2.30:1 between #181510 and #585047 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-redesign.html:30` — Contrast 1.01:1 between #cdeee8 and #f9e3c8 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-redesign.html:30` — Contrast 1.14:1 between #f9e3c8 and #f7f5f1 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-redesign.html:34` — Contrast 1.09:1 between #f7f5f1 and #ffffff (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-redesign.html:34` — Contrast 1.16:1 between #ffffff and #f0eee9 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-redesign.html:34` — Contrast 1.22:1 between #f0eee9 and #ddd8ce (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-redesign.html:35` — Contrast 2.30:1 between #181510 and #585047 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/public/redesing/lexis-redesign.html:35` — Contrast 1.01:1 between #cdeee8 and #f9e3c8 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:8` — Contrast 1.06:1 between #090b10 and #10131a (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:9` — Contrast 1.06:1 between #10131a and #151922 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:10` — Contrast 1.09:1 between #151922 and #1c212c (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:11` — Contrast 1.17:1 between #1c212c and #272d3a (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:12` — Contrast 1.37:1 between #272d3a and #3a4252 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:14` — Contrast 2.30:1 between #eef1f5 and #97a1b3 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:15` — Contrast 2.18:1 between #97a1b3 and #5e6779 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:16` — Contrast 1.78:1 between #5e6779 and #8b7fff (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:17` — Contrast 2.42:1 between #8b7fff and #4f45a3 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:24` — Contrast 1.46:1 between #e08a8a and #6ed7a5 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:25` — Contrast 1.62:1 between #6ed7a5 and #f7f5f1 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:32` — Contrast 1.09:1 between #f7f5f1 and #ffffff (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:33` — Contrast 1.04:1 between #ffffff and #fbfaf7 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:34` — Contrast 1.11:1 between #fbfaf7 and #f0eee9 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:35` — Contrast 1.18:1 between #f0eee9 and #e0dcd2 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:36` — Contrast 1.22:1 between #e0dcd2 and #cdc8be (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:38` — Contrast 2.95:1 between #14161c and #5b6270 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:39` — Contrast 1.89:1 between #5b6270 and #8a8f99 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:40` — Contrast 1.66:1 between #8a8f99 and #6557d8 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:42` — Contrast 2.24:1 between #d4d0f6 and #2b9d8f (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:44` — Contrast 2.69:1 between #2b9d8f and #cdeee8 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:45` — Contrast 2.75:1 between #cdeee8 and #c47a2e (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:46` — Contrast 2.73:1 between #c47a2e and #f9e3c8 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:48` — Contrast 1.19:1 between #b94a4a and #2e8a62 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:55` — Contrast 1.09:1 between #f7f5f1 and #ffffff (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:56` — Contrast 1.04:1 between #ffffff and #fbfaf7 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:57` — Contrast 1.11:1 between #fbfaf7 and #f0eee9 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:58` — Contrast 1.18:1 between #f0eee9 and #e0dcd2 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:59` — Contrast 1.22:1 between #e0dcd2 and #cdc8be (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:61` — Contrast 2.95:1 between #14161c and #5b6270 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:62` — Contrast 1.89:1 between #5b6270 and #8a8f99 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:63` — Contrast 1.66:1 between #8a8f99 and #6557d8 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:65` — Contrast 2.24:1 between #d4d0f6 and #2b9d8f (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:67` — Contrast 2.69:1 between #2b9d8f and #cdeee8 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:68` — Contrast 2.75:1 between #cdeee8 and #c47a2e (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:69` — Contrast 2.73:1 between #c47a2e and #f9e3c8 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:71` — Contrast 1.19:1 between #b94a4a and #2e8a62 (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:205` — Contrast 1.00:1 between #fff and #fff (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:209` — Contrast 1.00:1 between #fff and #fff (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:805` — Contrast 1.00:1 between #fff and #fff (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:1050` — Contrast 1.00:1 between #272d3a and #272d3a (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `site/src/styles/global.css:1090` — Contrast 1.17:1 between #272d3a and #1c212c (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text
- [ ] `tests/fixtures/desx/slop.css:1` — Contrast 2.32:1 between #aaaaaa and #ffffff (below 3:1 large-text minimum)
      sugerencia: Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text

### P1 — importante
- [ ] `benchmarks/results/opencode-go-2026-06-16-report.html:190` — Contrast 3.21:1 between #9fd4a8 and #4a7356 (below 4.5:1 body text)
      sugerencia: Raise contrast to ≥ 4.5:1 for body-sized text, or confirm large-text exception
- [ ] `benchmarks/results/opencode-go-2026-06-16-report.html:75` — Repeated card/panel/tile nested inside the same pattern (structural slop)
      sugerencia: Flatten: one surface, not card-in-card. Reuse a single container token
- [ ] `site/public/redesing/lexis-combined.html:16` — Contrast 3.09:1 between #151515 and #66645e (below 4.5:1 body text)
      sugerencia: Raise contrast to ≥ 4.5:1 for body-sized text, or confirm large-text exception
- [ ] `site/public/redesing/lexis-combined.html:17` — Contrast 3.95:1 between #66645e and #d6d3ca (below 4.5:1 body text)
      sugerencia: Raise contrast to ≥ 4.5:1 for body-sized text, or confirm large-text exception
- [ ] `site/public/redesing/lexis-combined.html:18` — Contrast 3.86:1 between #d6d3ca and #27734a (below 4.5:1 body text)
      sugerencia: Raise contrast to ≥ 4.5:1 for body-sized text, or confirm large-text exception
- [ ] `site/public/redesing/lexis-combined.html:19` — Contrast 3.11:1 between #27734a and #171717 (below 4.5:1 body text)
      sugerencia: Raise contrast to ≥ 4.5:1 for body-sized text, or confirm large-text exception
- [ ] `site/public/redesing/lexis-combined.html:33` — Contrast 4.43:1 between #9a988f and #333230 (below 4.5:1 body text)
      sugerencia: Raise contrast to ≥ 4.5:1 for body-sized text, or confirm large-text exception
- [ ] `site/public/redesing/lexis-combined.html:38` — Contrast 4.43:1 between #9a988f and #333230 (below 4.5:1 body text)
      sugerencia: Raise contrast to ≥ 4.5:1 for body-sized text, or confirm large-text exception
- [ ] `site/public/redesing/lexis-combined.html:252` — Contrast 3.64:1 between #37352f and #8e8c85 (below 4.5:1 body text)
      sugerencia: Raise contrast to ≥ 4.5:1 for body-sized text, or confirm large-text exception
- [ ] `site/public/redesing/lexis-combined.html:382` — Repeated card/panel/tile nested inside the same pattern (structural slop)
      sugerencia: Flatten: one surface, not card-in-card. Reuse a single container token
- [ ] `site/public/redesing/lexis-combined.html:631` — Repeated card/panel/tile nested inside the same pattern (structural slop)
      sugerencia: Flatten: one surface, not card-in-card. Reuse a single container token
- [ ] `site/public/redesing/lexis-combined.html:651` — Repeated card/panel/tile nested inside the same pattern (structural slop)
      sugerencia: Flatten: one surface, not card-in-card. Reuse a single container token
- [ ] `site/public/redesing/lexis-landing-wireframe.html:13` — Contrast 3.09:1 between #151515 and #66645e (below 4.5:1 body text)
      sugerencia: Raise contrast to ≥ 4.5:1 for body-sized text, or confirm large-text exception
- [ ] `site/public/redesing/lexis-landing-wireframe.html:14` — Contrast 3.95:1 between #66645e and #d6d3ca (below 4.5:1 body text)
      sugerencia: Raise contrast to ≥ 4.5:1 for body-sized text, or confirm large-text exception
- [ ] `site/public/redesing/lexis-landing-wireframe.html:16` — Contrast 3.16:1 between #151515 and #27734a (below 4.5:1 body text)
      sugerencia: Raise contrast to ≥ 4.5:1 for body-sized text, or confirm large-text exception
- [ ] `site/public/redesing/lexis-landing-wireframe.html:838` — Contrast 3.64:1 between #37352f and #8e8c85 (below 4.5:1 body text)
      sugerencia: Raise contrast to ≥ 4.5:1 for body-sized text, or confirm large-text exception
- [ ] `site/public/redesing/lexis-landing-wireframe.html:1079` — Repeated card/panel/tile nested inside the same pattern (structural slop)
      sugerencia: Flatten: one surface, not card-in-card. Reuse a single container token
- [ ] `site/public/redesing/lexis-landing-wireframe.html:1319` — Repeated card/panel/tile nested inside the same pattern (structural slop)
      sugerencia: Flatten: one surface, not card-in-card. Reuse a single container token
- [ ] `site/public/redesing/lexis-landing-wireframe.html:1383` — Repeated card/panel/tile nested inside the same pattern (structural slop)
      sugerencia: Flatten: one surface, not card-in-card. Reuse a single container token
- [ ] `site/public/redesing/lexis-redesign.html:353` — Heading skip h2 → h4
      sugerencia: Do not skip heading levels; insert the missing rank or lower the jump
- [ ] `site/public/redesing/lexis-redesign.html:437` — Heading skip h2 → h4
      sugerencia: Do not skip heading levels; insert the missing rank or lower the jump
- [ ] `site/public/redesing/lexis-redesign.html:481` — Heading skip h2 → h4
      sugerencia: Do not skip heading levels; insert the missing rank or lower the jump
- [ ] `site/public/redesing/lexis-redesign.html:572` — Heading skip h2 → h4
      sugerencia: Do not skip heading levels; insert the missing rank or lower the jump
- [ ] `site/public/redesing/lexis-redesign.html:319` — Repeated card/panel/tile nested inside the same pattern (structural slop)
      sugerencia: Flatten: one surface, not card-in-card. Reuse a single container token
- [ ] `site/public/redesing/lexis-redesign.html:435` — Repeated card/panel/tile nested inside the same pattern (structural slop)
      sugerencia: Flatten: one surface, not card-in-card. Reuse a single container token
- [ ] `site/public/redesing/lexis-redesign.html:445` — Repeated card/panel/tile nested inside the same pattern (structural slop)
      sugerencia: Flatten: one surface, not card-in-card. Reuse a single container token
- [ ] `site/public/redesing/lexis-redesign.html:455` — Repeated card/panel/tile nested inside the same pattern (structural slop)
      sugerencia: Flatten: one surface, not card-in-card. Reuse a single container token
- [ ] `site/src/styles/global.css:18` — Contrast 4.48:1 between #4f45a3 and #5fd8c9 (below 4.5:1 body text)
      sugerencia: Raise contrast to ≥ 4.5:1 for body-sized text, or confirm large-text exception
- [ ] `site/src/styles/global.css:20` — Contrast 4.39:1 between #5fd8c9 and #2a5c57 (below 4.5:1 body text)
      sugerencia: Raise contrast to ≥ 4.5:1 for body-sized text, or confirm large-text exception
- [ ] `site/src/styles/global.css:21` — Contrast 3.61:1 between #2a5c57 and #f2a154 (below 4.5:1 body text)
      sugerencia: Raise contrast to ≥ 4.5:1 for body-sized text, or confirm large-text exception
- [ ] `site/src/styles/global.css:23` — Contrast 3.77:1 between #5a3f20 and #e08a8a (below 4.5:1 body text)
      sugerencia: Raise contrast to ≥ 4.5:1 for body-sized text, or confirm large-text exception
- [ ] `site/src/styles/global.css:41` — Contrast 3.62:1 between #6557d8 and #d4d0f6 (below 4.5:1 body text)
      sugerencia: Raise contrast to ≥ 4.5:1 for body-sized text, or confirm large-text exception
- [ ] `site/src/styles/global.css:47` — Contrast 4.07:1 between #f9e3c8 and #b94a4a (below 4.5:1 body text)
      sugerencia: Raise contrast to ≥ 4.5:1 for body-sized text, or confirm large-text exception
- [ ] `site/src/styles/global.css:49` — Contrast 3.91:1 between #2e8a62 and #f7f5f1 (below 4.5:1 body text)
      sugerencia: Raise contrast to ≥ 4.5:1 for body-sized text, or confirm large-text exception
- [ ] `site/src/styles/global.css:64` — Contrast 3.62:1 between #6557d8 and #d4d0f6 (below 4.5:1 body text)
      sugerencia: Raise contrast to ≥ 4.5:1 for body-sized text, or confirm large-text exception
- [ ] `site/src/styles/global.css:70` — Contrast 4.07:1 between #f9e3c8 and #b94a4a (below 4.5:1 body text)
      sugerencia: Raise contrast to ≥ 4.5:1 for body-sized text, or confirm large-text exception
- [ ] `site/src/styles/global.css:1597` — Contrast 4.32:1 between #272d3a and rgba(139, 127, 255, 0.14) (below 4.5:1 body text)
      sugerencia: Raise contrast to ≥ 4.5:1 for body-sized text, or confirm large-text exception
- [ ] `tests/fixtures/desx/slop.css:13` — Spacing 13px is off the detected 4px scale
      sugerencia: Snap to the project spacing scale (multiples of 4px or existing tokens)
- [ ] `tests/fixtures/desx/slop.tsx:5` — Heading skip h1 → h3
      sugerencia: Do not skip heading levels; insert the missing rank or lower the jump
- [ ] `tests/fixtures/desx/slop.tsx:6` — Repeated card/panel/tile nested inside the same pattern (structural slop)
      sugerencia: Flatten: one surface, not card-in-card. Reuse a single container token
- [ ] `tests/fixtures/desx/slop.tsx:12` — Same class "btn" used for enabled and disabled buttons with no extra visual attribute
      sugerencia: Add a distinct disabled visual (opacity, token, or cursor) — not the same class alone

### P2 / P3 — pulido
- [ ] `benchmarks/results/opencode-go-2026-06-16-report.html:1` — 5 distinct font-size values in one file
      sugerencia: Cap a view at 3–4 type sizes from the existing type scale
- [ ] `site/public/redesing/lexis-combined.html:1` — 10 distinct font-size values in one file
      sugerencia: Cap a view at 3–4 type sizes from the existing type scale
- [ ] `site/public/redesing/lexis-landing-wireframe.html:1` — 9 distinct font-size values in one file
      sugerencia: Cap a view at 3–4 type sizes from the existing type scale
- [ ] `site/public/redesing/lexis-redesign.html:1` — 21 distinct font-size values in one file
      sugerencia: Cap a view at 3–4 type sizes from the existing type scale
- [ ] `site/src/styles/global.css:1` — 11 distinct font-size values in one file
      sugerencia: Cap a view at 3–4 type sizes from the existing type scale
- [ ] `tests/fixtures/desx/slop.css:26` — border-radius 13px is off the detected 4px scale
      sugerencia: Reuse existing radius tokens; avoid one-off radii
- [ ] `tests/fixtures/desx/slop.css:1` — 5 distinct font-size values in one file
      sugerencia: Cap a view at 3–4 type sizes from the existing type scale

## Plan de aplicación
1. Resolver todos los P0 primero.
2. Agrupar P1 por componente para minimizar diffs dispersos.
3. P2/P3 son opcionales — si se posponen, marcar en el código con `// lexis: design-debt` y dejar el checkbox sin tildar aquí.

## Resueltos en corridas anteriores
- _(none yet)_
