#!/usr/bin/env node
// Deterministic design-slop detector (no model). Source-level CSS/markup —
// not a browser computed-style engine.
// lexis: skip Puppeteer — stdlib parse is enough for v1 lint-style flags

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'out',
  'coverage',
  '.astro',
  '.cache',
  '.specxis',
]);

const UI_EXT = new Set([
  '.css',
  '.scss',
  '.sass',
  '.less',
  '.html',
  '.htm',
  '.vue',
  '.svelte',
  '.jsx',
  '.tsx',
  '.css.ts',
  '.css.js',
]);

const HEX = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
const RGB = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+)?\s*\)/g;
const PX = /(-?[\d.]+)px\b/g;

function srgbChannel(c) {
  const n = c / 255;
  return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(rgb) {
  return (
    0.2126 * srgbChannel(rgb.r) +
    0.7152 * srgbChannel(rgb.g) +
    0.0722 * srgbChannel(rgb.b)
  );
}

function contrastRatio(a, b) {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function parseHex(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  if (h.length === 8) h = h.slice(0, 6);
  if (h.length !== 6) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function parseRgbMatch(m) {
  return {
    r: Math.min(255, Number(m[1])),
    g: Math.min(255, Number(m[2])),
    b: Math.min(255, Number(m[3])),
  };
}

function extractColors(text) {
  const colors = [];
  HEX.lastIndex = 0;
  let m;
  while ((m = HEX.exec(text))) {
    const rgb = parseHex(m[1]);
    if (rgb) colors.push({ rgb, index: m.index, raw: m[0] });
  }
  RGB.lastIndex = 0;
  while ((m = RGB.exec(text))) {
    colors.push({ rgb: parseRgbMatch(m), index: m.index, raw: m[0] });
  }
  return colors;
}

function lineAt(text, index) {
  return text.slice(0, index).split(/\n/).length;
}

function rel(cwd, abs) {
  return path.relative(cwd, abs).split(path.sep).join('/');
}

function shouldScanFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath);
  if (base.endsWith('.css.ts') || base.endsWith('.css.js')) return true;
  return UI_EXT.has(ext);
}

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
      walk(abs, acc);
    } else if (shouldScanFile(entry.name)) {
      acc.push(abs);
    }
  }
  return acc;
}

function gitTouched(cwd) {
  const result = spawnSync('git', ['diff', '--name-only', 'HEAD'], {
    cwd,
    encoding: 'utf8',
  });
  if (result.status !== 0 || !result.stdout) return null;
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => path.join(cwd, line))
    .filter((abs) => fs.existsSync(abs) && shouldScanFile(abs));
}

function cssLengthPx(value) {
  const rem = value.match(/^([\d.]+)rem$/i);
  if (rem) return Number(rem[1]) * 16;
  const px = value.match(/^([\d.]+)px$/i);
  if (px) return Number(px[1]);
  return null;
}

function collectCssLengths(text, propNames) {
  const found = [];
  const re = new RegExp(
    `(${propNames.join('|')})\\s*:\\s*([^;}{]+)`,
    'gi',
  );
  let m;
  while ((m = re.exec(text))) {
    const chunk = m[2];
    PX.lastIndex = 0;
    let px;
    while ((px = PX.exec(chunk))) {
      found.push({
        px: Number(px[1]),
        index: m.index + px.index,
      });
    }
    const rem = chunk.match(/([\d.]+)rem/i);
    if (rem && !chunk.includes('px')) {
      found.push({ px: Number(rem[1]) * 16, index: m.index });
    }
  }
  return found;
}

function scaleOutliers(values) {
  if (values.length < 8) return [];
  const multiples = values.filter((v) => Math.abs(v.px) % 4 < 0.01);
  if (multiples.length / values.length < 0.9) return [];
  return values.filter((v) => Math.abs(v.px) % 4 >= 0.01 && Math.abs(v.px) > 0);
}

function finding(category, severity, file, line, description, suggestion) {
  return { category, severity, file, line, description, suggestion };
}

function scanFile(cwd, abs) {
  const file = rel(cwd, abs);
  let text;
  try {
    text = fs.readFileSync(abs, 'utf8');
  } catch {
    return { findings: [], stats: {} };
  }

  const findings = [];
  const colors = extractColors(text);
  let contrastPairs = 0;

  for (let i = 0; i < colors.length - 1; i += 1) {
    const a = colors[i];
    const b = colors[i + 1];
    if (b.index - a.index > 180) continue;
    contrastPairs += 1;
    const ratio = contrastRatio(a.rgb, b.rgb);
    if (ratio < 3) {
      findings.push(
        finding(
          'contrast',
          'P0',
          file,
          lineAt(text, a.index),
          `Contrast ${ratio.toFixed(2)}:1 between ${a.raw} and ${b.raw} (below 3:1 large-text minimum)`,
          'Use token pair with WCAG contrast ≥ 4.5:1 body / 3:1 large text',
        ),
      );
    } else if (ratio < 4.5) {
      findings.push(
        finding(
          'contrast',
          'P1',
          file,
          lineAt(text, a.index),
          `Contrast ${ratio.toFixed(2)}:1 between ${a.raw} and ${b.raw} (below 4.5:1 body text)`,
          'Raise contrast to ≥ 4.5:1 for body-sized text, or confirm large-text exception',
        ),
      );
    }
  }

  const spacing = collectCssLengths(text, [
    'padding',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'margin',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'gap',
    'row-gap',
    'column-gap',
  ]);
  for (const item of scaleOutliers(spacing)) {
    findings.push(
      finding(
        'spacing',
        'P1',
        file,
        lineAt(text, item.index),
        `Spacing ${item.px}px is off the detected 4px scale`,
        'Snap to the project spacing scale (multiples of 4px or existing tokens)',
      ),
    );
  }

  const radii = collectCssLengths(text, ['border-radius']);
  for (const item of scaleOutliers(radii)) {
    findings.push(
      finding(
        'radius',
        'P2',
        file,
        lineAt(text, item.index),
        `border-radius ${item.px}px is off the detected 4px scale`,
        'Reuse existing radius tokens; avoid one-off radii',
      ),
    );
  }

  const fontSizes = [];
  const fontRe = /font-size\s*:\s*([^;}{]+)/gi;
  let fm;
  while ((fm = fontRe.exec(text))) {
    const px = cssLengthPx(fm[1].trim().split(/\s+/)[0]);
    if (px != null) fontSizes.push(px);
  }
  const uniqueFonts = [...new Set(fontSizes.map((n) => Math.round(n * 10) / 10))];
  if (uniqueFonts.length > 4) {
    findings.push(
      finding(
        'type-hierarchy',
        'P2',
        file,
        1,
        `${uniqueFonts.length} distinct font-size values in one file`,
        'Cap a view at 3–4 type sizes from the existing type scale',
      ),
    );
  }

  const headings = [];
  const hRe = /<h([1-6])\b/gi;
  let hm;
  while ((hm = hRe.exec(text))) {
    headings.push({ level: Number(hm[1]), index: hm.index });
  }
  for (let i = 1; i < headings.length; i += 1) {
    const prev = headings[i - 1].level;
    const next = headings[i].level;
    if (next > prev + 1) {
      findings.push(
        finding(
          'type-hierarchy',
          'P1',
          file,
          lineAt(text, headings[i].index),
          `Heading skip h${prev} → h${next}`,
          'Do not skip heading levels; insert the missing rank or lower the jump',
        ),
      );
    }
  }

  const nestRe =
    /<(div|article|section|aside)[^>]{0,200}(class(Name)?)=["'][^"']*(card|panel|tile)[^"']*["'][^>]*>[\s\S]{0,400}<(div|article|section|aside)[^>]{0,200}(class(Name)?)=["'][^"']*(card|panel|tile)[^"']*["']/gi;
  let nm;
  while ((nm = nestRe.exec(text))) {
    findings.push(
      finding(
        'nesting',
        'P1',
        file,
        lineAt(text, nm.index),
        'Repeated card/panel/tile nested inside the same pattern (structural slop)',
        'Flatten: one surface, not card-in-card. Reuse a single container token',
      ),
    );
  }

  const btnRe =
    /<button\b([^>]*)>/gi;
  const buttons = [];
  let bm;
  while ((bm = btnRe.exec(text))) {
    buttons.push({ attrs: bm[1], index: bm.index });
  }
  const classOf = (attrs) => {
    const m = attrs.match(/class(Name)?=["']([^"']*)["']/);
    return m ? m[2] : '';
  };
  const byClass = new Map();
  for (const btn of buttons) {
    const cls = classOf(btn.attrs);
    if (!byClass.has(cls)) byClass.set(cls, []);
    byClass.get(cls).push(btn);
  }
  for (const [cls, group] of byClass) {
    if (!cls || group.length < 2) continue;
    const disabled = group.filter((b) => /\bdisabled\b|aria-disabled=["']true["']/.test(b.attrs));
    const enabled = group.filter((b) => !/\bdisabled\b|aria-disabled=["']true["']/.test(b.attrs));
    if (disabled.length && enabled.length) {
      findings.push(
        finding(
          'states',
          'P1',
          file,
          lineAt(text, disabled[0].index),
          `Same class "${cls}" used for enabled and disabled buttons with no extra visual attribute`,
          'Add a distinct disabled visual (opacity, token, or cursor) — not the same class alone',
        ),
      );
    }
  }

  return {
    findings,
    stats: {
      contrastPairs,
      spacingSamples: spacing.length,
      radiusSamples: radii.length,
      fontSizes: uniqueFonts.length,
      headings: headings.length,
    },
  };
}

function resolveAuditPath(cwd) {
  const docsDir = path.join(cwd, 'docs');
  if (fs.existsSync(docsDir) && fs.statSync(docsDir).isDirectory()) {
    return path.join(docsDir, 'DESIGN-AUDIT.md');
  }
  return path.join(cwd, 'DESIGN-AUDIT.md');
}

function parseExistingAudit(content) {
  const resolved = [];
  const pending = [];
  const lineRe =
    /^- \[([ xX])\] `([^`]+)` — (.+)$/;
  let section = '';
  for (const raw of content.split(/\r?\n/)) {
    if (raw.startsWith('## Resueltos')) section = 'resolved';
    else if (raw.startsWith('## Hallazgos')) section = 'pending';
    const m = raw.match(lineRe);
    if (!m) continue;
    const item = { checked: m[1] !== ' ', loc: m[2], description: m[3].trim() };
    if (item.loc.includes('_(') || item.description.startsWith('_(')) continue;
    if (section === 'resolved' || item.checked) resolved.push(item);
    else pending.push(item);
  }
  return { resolved, pending };
}

function renderAuditMarkdown(options) {
  const { findings, coverage, existing, isoDate } = options;
  const resolvedPrev = existing?.resolved ?? [];
  const pendingPrev = existing?.pending ?? [];

  const liveKeys = new Set(findings.map((f) => `${f.file}:${f.line}`));
  const newlyResolved = pendingPrev.filter((p) => !liveKeys.has(p.loc));

  const resolvedBlock = [
    ...resolvedPrev.map((r) => `- [x] \`${r.loc}\` — ${r.description}`),
    ...newlyResolved.map((r) => `- [x] \`${r.loc}\` — ${r.description} (resuelto ${isoDate})`),
  ];
  const seenResolved = new Set();
  const resolvedUniq = [];
  for (const line of resolvedBlock) {
    if (seenResolved.has(line)) continue;
    seenResolved.add(line);
    resolvedUniq.push(line);
  }

  const p0 = findings.filter((f) => f.severity === 'P0');
  const p1 = findings.filter((f) => f.severity === 'P1');
  const p2 = findings.filter((f) => f.severity === 'P2' || f.severity === 'P3');

  const bullet = (f) =>
    `- [ ] \`${f.file}:${f.line}\` — ${f.description}\n      sugerencia: ${f.suggestion}`;

  const empty = (label) => `- [ ] _(none)_ — no ${label} issues in this run`;

  return `# Design audit

Última corrida: ${isoDate}

## Contexto
- Sistema de diseño detectado: source-level scan (CSS/markup colors, spacing, radii, type). Not a browser computed-style engine.
- Categories evaluated: contrast, spacing, radius, type-hierarchy, nesting, states.
- Coverage: contrast pairs ${coverage.contrastPairs}; spacing samples ${coverage.spacingSamples}; radius samples ${coverage.radiusSamples}; files ${coverage.files}.
- Componentes existentes relevantes: inferred from class tokens card/panel/tile and heading tags when present.

## Hallazgos

### P0 — bloqueante
${p0.length ? p0.map(bullet).join('\n') : empty('P0')}

### P1 — importante
${p1.length ? p1.map(bullet).join('\n') : empty('P1')}

### P2 / P3 — pulido
${p2.length ? p2.map(bullet).join('\n') : empty('P2/P3')}

## Plan de aplicación
1. Resolver todos los P0 primero.
2. Agrupar P1 por componente para minimizar diffs dispersos.
3. P2/P3 son opcionales — si se posponen, marcar en el código con \`// lexis: design-debt\` y dejar el checkbox sin tildar aquí.

## Resueltos en corridas anteriores
${resolvedUniq.length ? resolvedUniq.join('\n') : '- _(none yet)_'}
`;
}

function runDesxAudit(options) {
  const cwd = path.resolve(options.cwd || process.cwd());
  const gitOnly = options.git === true;
  let files = gitTouched(cwd);
  if (!gitOnly || !files || files.length === 0) {
    files = walk(cwd);
  }

  const findings = [];
  const coverage = {
    files: files.length,
    contrastPairs: 0,
    spacingSamples: 0,
    radiusSamples: 0,
  };

  for (const abs of files) {
    const result = scanFile(cwd, abs);
    findings.push(...result.findings);
    coverage.contrastPairs += result.stats.contrastPairs || 0;
    coverage.spacingSamples += result.stats.spacingSamples || 0;
    coverage.radiusSamples += result.stats.radiusSamples || 0;
  }

  const outPath = options.outPath
    ? path.resolve(cwd, options.outPath)
    : resolveAuditPath(cwd);

  let existing;
  if (fs.existsSync(outPath)) {
    existing = parseExistingAudit(fs.readFileSync(outPath, 'utf8'));
  }

  const isoDate = (options.now || new Date()).toISOString().slice(0, 10);
  const markdown = renderAuditMarkdown({
    findings,
    coverage,
    existing,
    isoDate,
  });

  if (!options.dryRun) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, markdown);
  }

  return { findings, coverage, outPath, markdown };
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const options = { git: false, json: false, help: false, cwd: process.cwd(), outPath: '' };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--git') options.git = true;
    else if (arg === '--json') options.json = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--cwd') {
      options.cwd = args[i + 1];
      i += 1;
    } else if (arg === '--out') {
      options.outPath = args[i + 1];
      i += 1;
    }
  }
  return options;
}

function main() {
  const options = parseArgs(process.argv);
  if (options.help) {
    console.log('Usage: node scripts/desx-audit.js [--cwd dir] [--out path] [--git] [--json]');
    console.log('Writes DESIGN-AUDIT.md (docs/ if that folder exists). No model required.');
    process.exit(0);
  }
  const result = runDesxAudit(options);
  if (options.json) {
    console.log(JSON.stringify({ findings: result.findings, coverage: result.coverage, outPath: result.outPath }, null, 2));
  } else {
    console.log(`wrote ${result.outPath.replace(/\\/g, '/')} (${result.findings.length} findings)`);
  }
}

module.exports = {
  contrastRatio,
  parseHex,
  runDesxAudit,
  resolveAuditPath,
  renderAuditMarkdown,
  parseExistingAudit,
};

if (require.main === module) {
  main();
}
