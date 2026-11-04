#!/usr/bin/env node
// Deterministic design-quality detector (no model). Source-level CSS/markup —
// not a browser computed-style engine.
// lexis: skip Puppeteer — stdlib parse is enough for v1 lint-style flags

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

// Directory names never scanned (any path segment). Dot-directories are skipped by prefix.
const SKIP_SEGMENTS = new Set([
  'node_modules',
  'dist',
  'build',
  'out',
  'coverage',
  'fixtures',
  '__fixtures__',
  '__snapshots__',
  'vendor',
  'storybook-static',
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
]);

// Files whose text may hold selectors (used to learn which classes style :disabled).
const STYLE_EXT = new Set(['.css', '.scss', '.sass', '.less', '.html', '.htm', '.vue', '.svelte']);

const PX = /(-?[\d.]+)px\b/g;
const HEX_VALUE = /#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/;
const RGB_VALUE = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/;

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

// Reads the first color literal in a CSS value. Returns null when the value has none we can
// evaluate: var(), hsl(), named colors, gradients, or any transparency (alpha < 1).
function parseColorValue(value) {
  if (/gradient\(|var\(/i.test(value)) return null;
  const hex = value.match(HEX_VALUE);
  const rgb = value.match(RGB_VALUE);
  const useHex = hex && (!rgb || hex.index < rgb.index);
  if (useHex) {
    const digits = hex[1];
    if (digits.length === 8 && parseInt(digits.slice(6), 16) < 255) return null;
    const color = parseHex(digits);
    return color ? { rgb: color, raw: hex[0] } : null;
  }
  if (rgb) {
    const alpha = rgb[4] === undefined ? 1 : Number(rgb[4]);
    if (alpha < 1) return null;
    return {
      rgb: {
        r: Math.min(255, Number(rgb[1])),
        g: Math.min(255, Number(rgb[2])),
        b: Math.min(255, Number(rgb[3])),
      },
      raw: rgb[0],
    };
  }
  return null;
}

function lineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i += 1) {
    if (text.charCodeAt(i) === 10) starts.push(i + 1);
  }
  return starts;
}

function lineOf(starts, index) {
  let lo = 0;
  let hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid] <= index) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
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

function hasSkippedSegment(relPath) {
  return relPath
    .split(/[\\/]/)
    .slice(0, -1)
    .some((seg) => SKIP_SEGMENTS.has(seg) || seg.startsWith('.'));
}

function walk(dir, root, acc = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_SEGMENTS.has(entry.name) || entry.name.startsWith('.')) continue;
      walk(abs, root, acc);
    } else if (shouldScanFile(entry.name)) {
      acc.push(abs);
    }
  }
  return acc;
}

function git(cwd, args) {
  const result = spawnSync('git', ['-C', cwd, ...args], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout : null;
}

const splitZ = (out) => (out || '').split('\0').filter(Boolean);

function toScannable(cwd, relPaths) {
  return [...new Set(relPaths)]
    .filter((p) => shouldScanFile(p) && !hasSkippedSegment(p))
    .map((p) => path.join(cwd, p))
    .filter((abs) => fs.existsSync(abs))
    .sort();
}

function isGitRepo(cwd) {
  return git(cwd, ['rev-parse', '--is-inside-work-tree']) !== null;
}

// Every UI file that is tracked or untracked-and-not-ignored. Outside a repo: a directory walk.
function listAllFiles(cwd) {
  if (isGitRepo(cwd)) {
    const out = git(cwd, ['ls-files', '-z', '--cached', '--others', '--exclude-standard']);
    return toScannable(cwd, splitZ(out));
  }
  return walk(cwd, cwd).filter((abs) => !hasSkippedSegment(rel(cwd, abs)));
}

// UI files changed since HEAD (staged or not) plus untracked ones. Paths are relative to cwd,
// so running from a subdirectory scans that subtree only. Works in a repo with no commits.
function listChangedFiles(cwd) {
  if (!isGitRepo(cwd)) return null;
  const hasHead = git(cwd, ['rev-parse', '--verify', '--quiet', 'HEAD']) !== null;
  const names = [
    ...splitZ(git(cwd, ['diff', '--name-only', '-z', '--relative', ...(hasHead ? ['HEAD'] : ['--cached'])])),
    ...splitZ(git(cwd, ['ls-files', '-z', '--modified'])),
    ...splitZ(git(cwd, ['ls-files', '-z', '--others', '--exclude-standard'])),
  ];
  return toScannable(cwd, names);
}

function cssLengthPx(value) {
  const rem = value.match(/^([\d.]+)rem$/i);
  if (rem) return Number(rem[1]) * 16;
  const px = value.match(/^([\d.]+)px$/i);
  if (px) return Number(px[1]);
  return null;
}

// Lengths that say nothing about a scale: calc() expressions, hairlines and sr-only offsets
// (under 2px), and pill radii (1000px and up).
function collectCssLengths(text, propNames) {
  const found = [];
  const re = new RegExp(`(${propNames.join('|')})\\s*:\\s*([^;}{]+)`, 'gi');
  let m;
  while ((m = re.exec(text))) {
    const chunk = m[2];
    if (/calc\(/i.test(chunk)) continue;
    PX.lastIndex = 0;
    let px;
    while ((px = PX.exec(chunk))) {
      const value = Number(px[1]);
      if (Math.abs(value) < 2 || Math.abs(value) >= 1000) continue;
      found.push({ px: value, index: m.index + px.index });
    }
    const rem = chunk.match(/([\d.]+)rem/i);
    if (rem && !chunk.includes('px')) {
      found.push({ px: Number(rem[1]) * 16, index: m.index });
    }
  }
  return found;
}

const MIN_SCALE_SAMPLES = 8;

function scaleOutliers(values) {
  if (values.length < MIN_SCALE_SAMPLES) return [];
  const multiples = values.filter((v) => Math.abs(v.px) % 4 < 0.01);
  if (multiples.length / values.length < 0.9) return [];
  return values.filter((v) => Math.abs(v.px) % 4 >= 0.01 && Math.abs(v.px) > 0);
}

function finding(category, severity, file, line, description, suggestion) {
  return { category, severity, file, line, description, suggestion };
}

// Classes (or "all buttons") that some stylesheet styles when disabled, so a disabled button
// of that class is visually distinct and must not be reported.
function collectDisabledStyles(files) {
  const styled = { all: false, classes: new Set() };
  for (const abs of files) {
    if (!STYLE_EXT.has(path.extname(abs).toLowerCase())) continue;
    let text;
    try {
      text = fs.readFileSync(abs, 'utf8');
    } catch {
      continue;
    }
    const selectorRe = /([^{}]+)\{/g;
    let m;
    while ((m = selectorRe.exec(text))) {
      for (const part of m[1].split(',')) {
        if (!/:disabled|\[disabled|\[aria-disabled/.test(part)) continue;
        const classes = [...part.matchAll(/\.([\w-]+)/g)].map((c) => c[1]);
        if (classes.length === 0) styled.all = true;
        for (const cls of classes) styled.classes.add(cls);
      }
    }
  }
  return styled;
}

const isStaticDisabled = (attrs) =>
  /(?:^|\s)disabled(?=\s|=|\/|$)(?!\s*=\s*\{)/.test(attrs) || /aria-disabled\s*=\s*["']true["']/.test(attrs);
const isDynamicDisabled = (attrs) => /(?:^|\s)disabled\s*=\s*\{/.test(attrs) || /aria-disabled\s*=\s*\{/.test(attrs);

function classTokens(attrs) {
  const m = attrs.match(/class(?:Name)?\s*=\s*(?:"([^"]*)"|'([^']*)')/);
  return m ? (m[1] ?? m[2]).split(/\s+/).filter(Boolean) : [];
}

// Card-inside-card: tracks tag depth, so sibling cards are never reported.
// lexis: tag scan is regex-based; a `>` inside a JSX attribute value can truncate one tag's attributes
function findNestedCards(text) {
  const tagRe = /<(\/?)(div|article|section|aside)\b([^>]*)>/gi;
  const stack = [];
  const hits = [];
  let m;
  while ((m = tagRe.exec(text))) {
    const tag = m[2].toLowerCase();
    if (m[1]) {
      for (let i = stack.length - 1; i >= 0; i -= 1) {
        if (stack[i].tag === tag) {
          stack.length = i;
          break;
        }
      }
      continue;
    }
    if (m[3].trimEnd().endsWith('/')) continue;
    const card = classTokens(m[3]).some((t) => /^(card|panel|tile)$/i.test(t));
    if (card && stack.some((s) => s.card)) hits.push(m.index);
    stack.push({ tag, card });
  }
  return hits;
}

// Pairs a `color` with a `background` declared in the same rule or style attribute.
function scanContrast(text, file, starts, stats, findings) {
  const blocks = [];
  const ruleRe = /([^{}]*)\{([^{}]*)\}/g;
  let m;
  while ((m = ruleRe.exec(text))) {
    blocks.push({ body: m[2], offset: m.index + m[1].length + 1 });
  }
  const styleRe = /\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  while ((m = styleRe.exec(text))) {
    const body = m[1] ?? m[2];
    blocks.push({ body, offset: m.index + m[0].indexOf(body) });
  }

  for (const { body, offset } of blocks) {
    const fg = [...body.matchAll(/(?:^|[;\s])color\s*:\s*([^;]+)/gi)].pop();
    const bg = [...body.matchAll(/(?:^|[;\s])background(?:-color)?\s*:\s*([^;]+)/gi)].pop();
    if (!fg || !bg) continue;
    const fgColor = parseColorValue(fg[1]);
    const bgColor = parseColorValue(bg[1]);
    if (!fgColor || !bgColor) {
      stats.contrastSkipped += 1;
      continue;
    }
    stats.contrastPairs += 1;
    const ratio = contrastRatio(fgColor.rgb, bgColor.rgb);
    const line = lineOf(starts, offset + fg.index);
    if (ratio < 3) {
      findings.push(
        finding(
          'contrast',
          'P0',
          file,
          line,
          `Contrast ${ratio.toFixed(2)}:1 between ${fgColor.raw} and ${bgColor.raw} (below 3:1 large-text minimum)`,
          'Use token pair with WCAG contrast >= 4.5:1 body / 3:1 large text',
        ),
      );
    } else if (ratio < 4.5) {
      findings.push(
        finding(
          'contrast',
          'P1',
          file,
          line,
          `Contrast ${ratio.toFixed(2)}:1 between ${fgColor.raw} and ${bgColor.raw} (below 4.5:1 body text)`,
          'Raise contrast to >= 4.5:1 for body-sized text, or confirm large-text exception',
        ),
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Shared CSS helpers (slopx reuses them: one CSS reader, not two)
// ---------------------------------------------------------------------------

// Rule bodies and style attributes: [{ selector, body, offset, inline }]. Regex based, so a
// nested at-rule body is read as its inner rules.
function cssBlocks(text) {
  const blocks = [];
  const ruleRe = /([^{}]*)\{([^{}]*)\}/g;
  let m;
  while ((m = ruleRe.exec(text))) {
    blocks.push({
      selector: m[1].replace(/\/\*[\s\S]*?\*\//g, '').trim(),
      body: m[2],
      offset: m.index + m[1].length + 1,
      inline: false,
    });
  }
  const styleRe = /\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  while ((m = styleRe.exec(text))) {
    const body = m[1] ?? m[2];
    blocks.push({ selector: '', body, offset: m.index + m[0].indexOf(body), inline: true });
  }
  return blocks;
}

// Declarations of a rule body: [{ prop, value, index }].
function declarations(body) {
  const out = [];
  const re = /(?:^|[;\s])([a-z-]+)\s*:\s*([^;]+)/gi;
  let m;
  while ((m = re.exec(body))) {
    out.push({ prop: m[1].toLowerCase(), value: m[2].trim(), index: m.index + m[0].indexOf(m[1]) });
  }
  return out;
}

// First color literal in a value, with or without transparency (parseColorValue refuses alpha).
function colorOf(value) {
  const hex = value.match(HEX_VALUE);
  const rgb = value.match(RGB_VALUE);
  if (hex && (!rgb || hex.index < rgb.index)) {
    const color = parseHex(hex[1]);
    return color ? { rgb: color, raw: hex[0] } : null;
  }
  if (rgb) {
    return {
      rgb: { r: Math.min(255, Number(rgb[1])), g: Math.min(255, Number(rgb[2])), b: Math.min(255, Number(rgb[3])) },
      raw: rgb[0],
    };
  }
  return null;
}

// { h: 0-360, s: 0-1, l: 0-1 } for an { r, g, b } color.
function hslOf({ r, g, b }) {
  const [R, G, B] = [r, g, b].map((v) => v / 255);
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === R) h = ((G - B) / d) % 6;
  else if (max === G) h = (B - R) / d + 2;
  else h = (R - G) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
}

// Selectors that style running text, not headings or badges.
const TEXT_SELECTOR = /(^|[\s,>+~])(p|li|body|article|td|label|blockquote)(?![\w-])|\.(prose|text|body|description|paragraph|copy|content)(?![\w-])/i;
const NOT_TEXT_SELECTOR = /h[1-6]|title|heading|display|hero|logo|badge|caption|legal|footnote|chip|tag|sup|sub/i;

// Objective quality rules: legibility and accessibility, whoever wrote the markup.
function scanQuality(text, file, starts, findings, isStyleFile) {
  const imgRe = /<img\b([^>]*)>/gi;
  let m;
  while ((m = imgRe.exec(text))) {
    if (!/\balt\s*=/.test(m[1]) && !/\{\s*\.\.\./.test(m[1])) {
      findings.push({
        ...finding('accessibility', 'P0', file, lineOf(starts, m.index), 'Image without an alt attribute', 'Describe the image in alt, or use alt="" for a purely decorative one'),
        rule: 'missing-alt',
      });
    }
  }
  const trackingClass = /class(?:Name)?\s*=\s*"[^"]*\btracking-tighter\b/g;
  while ((m = trackingClass.exec(text))) {
    findings.push({
      ...finding('legibility', 'P1', file, lineOf(starts, m.index), 'Letter spacing tighter than -0.04em (tracking-tighter)', 'Loosen the tracking; letters should stay distinguishable'),
      rule: 'crushed-tracking',
    });
  }
  if (!isStyleFile) return;

  for (const { selector, body, offset } of cssBlocks(text)) {
    const decls = declarations(body);
    const get = (prop) => decls.find((d) => d.prop === prop);
    const at = (d) => lineOf(starts, offset + d.index);
    const isText = TEXT_SELECTOR.test(selector) && !NOT_TEXT_SELECTOR.test(selector);

    const spacing = get('letter-spacing');
    if (spacing) {
      const em = spacing.value.match(/^(-?\d*\.?\d+)em\b/);
      if (em && Number(em[1]) < -0.04) {
        findings.push({ ...finding('legibility', 'P1', file, at(spacing), `Letter spacing ${em[1]}em is tighter than -0.04em`, 'Loosen the tracking; letters should stay distinguishable'), rule: 'crushed-tracking' });
      } else if (em && Number(em[1]) > 0.1 && isText) {
        findings.push({ ...finding('legibility', 'P2', file, at(spacing), `Body text letter spacing ${em[1]}em is wider than 0.1em`, 'Keep wide tracking for short labels, not running text'), rule: 'wide-body-tracking' });
      }
    }

    const size = get('font-size');
    const px = size && size.value.match(/^(\d*\.?\d+)px\b/);
    if (px && Number(px[1]) > 0 && Number(px[1]) <= 11 && !NOT_TEXT_SELECTOR.test(selector)) {
      findings.push({ ...finding('legibility', 'P2', file, at(size), `Text at ${px[1]}px is hard to read`, 'Use 12px or larger for interface text'), rule: 'tiny-text' });
    }

    const lh = get('line-height');
    const lhValue = lh && lh.value.match(/^(\d*\.?\d+)(%?)$/);
    if (lhValue && isText && (lhValue[2] ? Number(lhValue[1]) < 120 : Number(lhValue[1]) < 1.2)) {
      findings.push({ ...finding('legibility', 'P2', file, at(lh), `Line height ${lh.value} is tight for running text`, 'Use 1.4 to 1.6 for body text'), rule: 'tight-line-height' });
    }

    const align = get('text-align');
    if (align && /^justify\b/.test(align.value)) {
      findings.push({ ...finding('legibility', 'P2', file, at(align), 'Justified text leaves uneven word gaps', 'Use left alignment for running text'), rule: 'justified-text' });
    }

    const transform = get('text-transform');
    if (transform && /^uppercase\b/.test(transform.value) && isText) {
      findings.push({ ...finding('legibility', 'P2', file, at(transform), 'Running text in all caps is tiring to read', 'Keep uppercase for short labels'), rule: 'all-caps-body' });
    }

    const fg = get('color');
    const bg = get('background-color') || get('background');
    const fgColor = fg && parseColorValue(fg.value);
    const bgColor = bg && parseColorValue(bg.value);
    if (fgColor && bgColor) {
      const f = hslOf(fgColor.rgb);
      const b = hslOf(bgColor.rgb);
      if (f.s < 0.12 && f.l > 0.2 && f.l < 0.8 && b.s > 0.35) {
        findings.push({ ...finding('contrast', 'P1', file, at(fg), `Neutral gray text ${fgColor.raw} on the colored background ${bgColor.raw}`, 'Tint the text toward the background hue or use white or black'), rule: 'gray-on-color' });
      }
    }
  }
}

function scanFile(cwd, abs, ctx) {
  const file = rel(cwd, abs);
  let text;
  try {
    text = fs.readFileSync(abs, 'utf8');
  } catch {
    return { findings: [], stats: {} };
  }

  const findings = [];
  const starts = lineStarts(text);
  const stats = { contrastPairs: 0, contrastSkipped: 0 };

  scanContrast(text, file, starts, stats, findings);

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
        lineOf(starts, item.index),
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
        lineOf(starts, item.index),
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
        'Cap a view at 3-4 type sizes from the existing type scale',
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
          lineOf(starts, headings[i].index),
          `Heading skip h${prev} -> h${next}`,
          'Do not skip heading levels; insert the missing rank or lower the jump',
        ),
      );
    }
  }

  for (const index of findNestedCards(text)) {
    findings.push(
      finding(
        'nesting',
        'P1',
        file,
        lineOf(starts, index),
        'Card/panel/tile nested inside another card/panel/tile (hurts hierarchy)',
        'Flatten: one surface, not card-in-card. Reuse a single container token',
      ),
    );
  }

  const buttons = [];
  const btnRe = /<button\b([^>]*)>/gi;
  let bm;
  while ((bm = btnRe.exec(text))) {
    buttons.push({ attrs: bm[1], index: bm.index });
  }
  const byClass = new Map();
  for (const btn of buttons) {
    if (isDynamicDisabled(btn.attrs)) continue; // state is data-driven; cannot compare statically
    const key = classTokens(btn.attrs).join(' ');
    if (!byClass.has(key)) byClass.set(key, []);
    byClass.get(key).push(btn);
  }
  for (const [cls, group] of byClass) {
    if (!cls || group.length < 2) continue;
    const disabled = group.filter((b) => isStaticDisabled(b.attrs));
    const enabled = group.filter((b) => !isStaticDisabled(b.attrs));
    if (!disabled.length || !enabled.length) continue;
    const styled = ctx.disabledStyles;
    if (styled.all || cls.split(' ').some((t) => styled.classes.has(t))) continue;
    findings.push(
      finding(
        'states',
        'P1',
        file,
        lineOf(starts, disabled[0].index),
        `Same class "${cls}" used for enabled and disabled buttons, and no stylesheet styles :disabled for it`,
        'Add a distinct disabled visual (opacity, token, or cursor), not the same class alone',
      ),
    );
  }

  scanQuality(text, file, starts, findings, /\.(css|scss|sass|less|html|htm|vue|svelte|astro)$/i.test(abs));

  // Stable rule ids, used by slopx (desx/<rule>).
  const RULE_OF = { contrast: 'contrast', spacing: 'spacing-scale', radius: 'radius-scale', nesting: 'nested-cards', states: 'button-states' };
  for (const item of findings) {
    if (item.rule) continue;
    if (item.category === 'type-hierarchy') item.rule = /font-size/.test(item.description) ? 'type-sizes' : 'heading-skip';
    else item.rule = RULE_OF[item.category];
  }

  return {
    findings,
    stats: {
      ...stats,
      spacingSamples: spacing.length,
      radiusSamples: radii.length,
      fontSizeSamples: fontSizes.length,
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

// Stable identity for a finding: file + category + description + n-th occurrence of that triple.
// It does not depend on the line number, so an edit above a finding never "resolves" it.
function findingId(f, occurrence) {
  return crypto
    .createHash('sha1')
    .update(`${f.file}\u0000${f.category}\u0000${f.description}\u0000${occurrence}`)
    .digest('hex')
    .slice(0, 10);
}

function assignIds(findings) {
  const seen = new Map();
  return findings.map((f) => {
    const base = `${f.file}\u0000${f.category}\u0000${f.description}`;
    const n = (seen.get(base) || 0) + 1;
    seen.set(base, n);
    return { ...f, id: f.id || findingId(f, n) };
  });
}

// Reads reports written by this version and by 1.4.0 (Spanish headings, em dash).
function parseExistingAudit(content) {
  const resolved = [];
  const pending = [];
  const lineRe = /^- \[([ xX])\] `([^`]+)` (?:—|–|-) (.+)$/;
  let section = '';
  let severity = '';
  const legacySeen = new Map();
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    if (/^## (Resueltos|Resolved)/.test(raw)) section = 'resolved';
    else if (/^## (Hallazgos|Findings)/.test(raw)) section = 'pending';
    const sev = raw.match(/^### (P\d(?: \/ P\d)?)/);
    if (sev) severity = sev[1].startsWith('P0') ? 'P0' : sev[1].startsWith('P1') ? 'P1' : 'P2';
    const m = raw.match(lineRe);
    if (!m) continue;
    let description = m[3].trim();
    const idMatch = description.match(/\s*<!-- desx:([0-9a-f]+) -->\s*$/);
    const id = idMatch ? idMatch[1] : '';
    if (idMatch) description = description.slice(0, idMatch.index).trim();
    const item = { checked: m[1] !== ' ', loc: m[2], description, id, severity };
    if (item.loc.includes('_(') || item.description.startsWith('_(')) continue;
    const suggestion = (lines[i + 1] || '').match(/^\s+(?:sugerencia|suggestion):\s*(.*)$/);
    if (suggestion) item.suggestion = suggestion[1];
    const colon = item.loc.lastIndexOf(':');
    item.file = colon === -1 ? item.loc : item.loc.slice(0, colon);
    // Reports without an id are matched by file + description + occurrence.
    const legacyBase = `${item.file}\u0000${item.description}`;
    const n = (legacySeen.get(legacyBase) || 0) + 1;
    legacySeen.set(legacyBase, n);
    item.legacyKey = `${legacyBase}\u0000${n}`;
    if (section === 'resolved' || item.checked) resolved.push(item);
    else pending.push(item);
  }
  return { resolved, pending };
}

const SEVERITY_TITLES = {
  P0: 'P0 - blocking',
  P1: 'P1 - important',
  P2: 'P2 / P3 - polish',
};

function coverageLines(coverage, mode) {
  const lines = [];
  const samples = (label, n) =>
    `  - ${label}: ${n} samples${n < MIN_SCALE_SAMPLES ? ` (${MIN_SCALE_SAMPLES} needed to detect a scale): no data` : ''}`;
  lines.push(
    `  - contrast: ${coverage.contrastPairs || 0} color/background pairs checked, ${coverage.contrastSkipped || 0} skipped (var(), hsl(), named colors, gradients or transparency)`,
  );
  lines.push(samples('spacing', coverage.spacingSamples || 0));
  lines.push(samples('radius', coverage.radiusSamples || 0));
  lines.push(
    `  - type-hierarchy: ${coverage.headings || 0} headings, ${coverage.fontSizeSamples || 0} font-size declarations`,
  );
  lines.push('  - nesting, states: markup in the scanned files only');
  lines.push(`  - scope: ${mode === 'git' ? 'changed files only (--git)' : 'all UI files'}; ${coverage.files || 0} files`);
  lines.push('  - not analyzed: utility classes (Tailwind) and CSS-in-JS styles');
  return lines.join('\n');
}

function renderAuditMarkdown(options) {
  const { coverage, existing, isoDate, scannedFiles, mode } = options;
  const findings = assignIds(options.findings);
  const resolvedPrev = existing?.resolved ?? [];
  const pendingPrev = existing?.pending ?? [];

  const liveIds = new Set(findings.map((f) => f.id));
  const liveLegacy = new Set();
  {
    const seen = new Map();
    for (const f of findings) {
      const base = `${f.file}\u0000${f.description}`;
      const n = (seen.get(base) || 0) + 1;
      seen.set(base, n);
      liveLegacy.add(`${base}\u0000${n}`);
    }
  }
  const isLive = (p) => (p.id ? liveIds.has(p.id) : liveLegacy.has(p.legacyKey));
  const wasScanned = (p) => !scannedFiles || scannedFiles.has(p.file);

  // Items of files this run did not scan stay exactly as they were.
  const carried = pendingPrev.filter((p) => !wasScanned(p));
  const newlyResolved = pendingPrev.filter((p) => wasScanned(p) && !isLive(p));

  const stripDate = (d) => d.replace(/\s*\((?:resuelto|resolved) [\d-]+\)\s*$/, '');
  const resolvedBlock = [
    ...resolvedPrev.map((r) => `- [x] \`${r.loc}\` - ${r.description}`),
    ...newlyResolved.map((r) => `- [x] \`${r.loc}\` - ${stripDate(r.description)} (resolved ${isoDate})`),
  ];
  const resolvedUniq = [...new Set(resolvedBlock)];

  const bullet = (f) =>
    `- [ ] \`${f.file}:${f.line}\` - ${f.description} <!-- desx:${f.id} -->\n      suggestion: ${f.suggestion}`;
  const carriedBullet = (p) =>
    `- [ ] \`${p.loc}\` - ${p.description}${p.id ? ` <!-- desx:${p.id} -->` : ''}\n      suggestion: ${p.suggestion || ''}`;

  const bucket = (sev) => {
    const live = findings
      .filter((f) => (sev === 'P2' ? f.severity === 'P2' || f.severity === 'P3' : f.severity === sev))
      .map(bullet);
    const kept = carried.filter((p) => (p.severity || 'P2') === sev).map(carriedBullet);
    const all = [...live, ...kept];
    return all.length ? all.join('\n') : `- [ ] _(none)_ - no ${sev === 'P2' ? 'P2/P3' : sev} issues in this run`;
  };

  return `# Design audit

Last run: ${isoDate}

## Context
- Design system: source-level scan (CSS/markup colors, spacing, radii, type). Not a browser computed-style engine.
- Categories evaluated: contrast, spacing, radius, type-hierarchy, nesting, states, accessibility, legibility.
- Coverage:
${coverageLines(coverage, mode)}
- Components: inferred from class tokens card/panel/tile and heading tags when present.

## Findings

### ${SEVERITY_TITLES.P0}
${bucket('P0')}

### ${SEVERITY_TITLES.P1}
${bucket('P1')}

### ${SEVERITY_TITLES.P2}
${bucket('P2')}

## Apply plan
1. Resolve all P0 first.
2. Group P1 by component to keep diffs together.
3. P2/P3 are optional. If postponed, mark the code with \`// lexis: design-debt\` and leave the checkbox unticked here.

## Resolved in previous runs
${resolvedUniq.length ? resolvedUniq.join('\n') : '- _(none yet)_'}
`;
}

function runDesxAudit(options) {
  const cwd = path.resolve(options.cwd || process.cwd());
  if (!fs.existsSync(cwd) || !fs.statSync(cwd).isDirectory()) {
    throw new Error(`--cwd does not exist or is not a directory: ${cwd}`);
  }

  let outPath = resolveAuditPath(cwd);
  if (options.outPath) {
    outPath = path.resolve(cwd, options.outPath);
    if (!path.isAbsolute(options.outPath) && path.relative(cwd, outPath).startsWith('..')) {
      throw new Error('--out must stay inside --cwd (use an absolute path to write elsewhere)');
    }
  }

  const allFiles = listAllFiles(cwd);
  let files = Array.isArray(options.files) ? options.files : allFiles;
  let mode = 'full';
  if (options.git === true && !Array.isArray(options.files)) {
    mode = 'git';
    files = listChangedFiles(cwd);
    if (files === null) throw new Error('--git needs a git repository');
    if (files.length === 0) {
      return {
        findings: [],
        coverage: { files: 0 },
        outPath,
        markdown: '',
        written: false,
        note: 'No changed UI files since HEAD (staged, unstaged or untracked); nothing scanned. Report not modified.',
      };
    }
  }

  const ctx = { disabledStyles: collectDisabledStyles(allFiles) };
  const findings = [];
  const coverage = {
    files: files.length,
    contrastPairs: 0,
    contrastSkipped: 0,
    spacingSamples: 0,
    radiusSamples: 0,
    fontSizeSamples: 0,
    headings: 0,
  };

  for (const abs of files) {
    const result = scanFile(cwd, abs, ctx);
    findings.push(...result.findings);
    for (const key of Object.keys(coverage)) {
      if (key !== 'files') coverage[key] += result.stats[key] || 0;
    }
  }

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
    mode,
    scannedFiles: mode === 'git' ? new Set(files.map((abs) => rel(cwd, abs))) : undefined,
  });

  const written = !options.dryRun;
  if (written) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, markdown);
  }

  return { findings: assignIds(findings), coverage, outPath, markdown, written };
}

const USAGE =
  'Usage: node scripts/desx-audit.js [--cwd dir] [--out path] [--git] [--json] [--dry-run] [--fail-on P0]\n' +
  'Writes DESIGN-AUDIT.md (docs/ if that folder exists). --json and --dry-run print and write nothing. No model required.';

// args: process.argv.slice(2). Returns { options } or { error }.
function parseArgs(args) {
  const options = { git: false, json: false, dryRun: false, help: false, failOn: '', cwd: process.cwd(), outPath: '' };
  const needsValue = new Set(['--cwd', '--out', '--fail-on']);
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--git') options.git = true;
    else if (arg === '--json') options.json = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (needsValue.has(arg)) {
      const value = args[i + 1];
      if (value === undefined || value.startsWith('--')) return { error: `${arg} needs a value` };
      i += 1;
      if (arg === '--cwd') options.cwd = value;
      else if (arg === '--out') options.outPath = value;
      else if (value !== 'P0') return { error: '--fail-on only accepts P0' };
      else options.failOn = value;
    } else return { error: `Unknown option: ${arg}` };
  }
  return { options };
}

function main(args = process.argv.slice(2)) {
  const parsed = parseArgs(args);
  if (parsed.error) {
    console.error(`desx-audit: ${parsed.error}\n${USAGE}`);
    process.exit(2);
  }
  const { options } = parsed;
  if (options.help) {
    console.log(USAGE);
    process.exit(0);
  }
  let result;
  try {
    result = runDesxAudit({ ...options, dryRun: options.dryRun || options.json });
  } catch (e) {
    console.error(`desx-audit: ${e.message}`);
    process.exit(2);
  }
  if (options.json) {
    console.log(
      JSON.stringify({ findings: result.findings, coverage: result.coverage, outPath: result.outPath }, null, 2),
    );
  } else if (result.note) {
    console.log(result.note);
  } else if (result.written) {
    console.log(`wrote ${result.outPath.replace(/\\/g, '/')} (${result.findings.length} findings)`);
  } else {
    console.log(`dry run: ${result.findings.length} findings, nothing written`);
  }
  if (options.failOn && result.findings.some((f) => f.severity === 'P0')) process.exit(1);
}

module.exports = {
  contrastRatio,
  parseHex,
  parseColorValue,
  parseArgs,
  runDesxAudit,
  resolveAuditPath,
  renderAuditMarkdown,
  parseExistingAudit,
  findNestedCards,
  lineStarts,
  lineOf,
  cssBlocks,
  declarations,
  colorOf,
  hslOf,
};

if (require.main === module) {
  main();
}
