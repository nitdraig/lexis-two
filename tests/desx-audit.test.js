#!/usr/bin/env node

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  contrastRatio,
  parseHex,
  runDesxAudit,
  resolveAuditPath,
  parseExistingAudit,
  renderAuditMarkdown,
} = require('../scripts/desx-audit');

const fixtureDir = path.join(__dirname, 'fixtures', 'desx');

test('contrastRatio matches WCAG white on black', () => {
  const white = parseHex('ffffff');
  const black = parseHex('000000');
  assert.ok(white && black);
  assert.ok(Math.abs(contrastRatio(white, black) - 21) < 0.01);
});

test('runDesxAudit flags section-6 categories without a model', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-desx-'));
  fs.cpSync(fixtureDir, path.join(cwd, 'ui'), { recursive: true });

  const result = runDesxAudit({ cwd, now: new Date('2026-09-11') });
  const cats = new Set(result.findings.map((f) => f.category));

  assert.ok(cats.has('contrast'));
  assert.ok(cats.has('spacing'));
  assert.ok(cats.has('radius'));
  assert.ok(cats.has('type-hierarchy'));
  assert.ok(cats.has('nesting'));
  assert.ok(cats.has('states'));
  assert.equal(path.basename(result.outPath), 'DESIGN-AUDIT.md');
  assert.match(result.markdown, /Categories evaluated: contrast/);
  assert.match(fs.readFileSync(result.outPath, 'utf8'), /P0 — bloqueante/);
});

test('resolveAuditPath prefers docs/ when that folder exists', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-desx-docs-'));
  fs.mkdirSync(path.join(cwd, 'docs'));
  assert.equal(resolveAuditPath(cwd), path.join(cwd, 'docs', 'DESIGN-AUDIT.md'));
});

test('merge keeps Resueltos and moves vanished pending items', () => {
  const existing = parseExistingAudit(`# Design audit

## Hallazgos
- [ ] \`old.tsx:1\` — gone now
      sugerencia: unused

## Resueltos en corridas anteriores
- [x] \`kept.tsx:2\` — already done
`);

  const markdown = renderAuditMarkdown({
    findings: [],
    coverage: { contrastPairs: 0, spacingSamples: 0, radiusSamples: 0, files: 0 },
    existing,
    isoDate: '2026-09-11',
  });

  assert.match(markdown, /already done/);
  assert.match(markdown, /gone now \(resuelto 2026-09-11\)/);
  assert.doesNotMatch(markdown, /^- \[ \] `old\.tsx:1`/m);
});
