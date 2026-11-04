#!/usr/bin/env node

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { spawnSync } = require('child_process');

const script = path.join(__dirname, '..', 'scripts', 'desx-audit.js');

const {
  contrastRatio,
  parseHex,
  parseArgs,
  findNestedCards,
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
  assert.match(fs.readFileSync(result.outPath, 'utf8'), /P0 - blocking/);
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
  assert.match(markdown, /gone now \(resolved 2026-09-11\)/);
  assert.doesNotMatch(markdown, /^- \[ \] `old\.tsx:1`/m);
});

// ---------------------------------------------------------------------------
// Helpers for the behavior tests below
// ---------------------------------------------------------------------------

function project(files) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-desx-t-'));
  for (const [name, content] of Object.entries(files)) {
    const abs = path.join(cwd, name);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
  }
  return cwd;
}

function git(cwd, ...args) {
  const r = spawnSync('git', ['-c', 'user.email=t@t.t', '-c', 'user.name=t', '-c', 'commit.gpgsign=false', ...args], {
    cwd,
    encoding: 'utf8',
  });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
}

function repoWithBase(files) {
  const cwd = project(files);
  git(cwd, 'init', '-q');
  git(cwd, 'add', '-A');
  git(cwd, 'commit', '-q', '-m', 'base');
  return cwd;
}

function cli(cwd, ...args) {
  return spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8' });
}

const audit = (cwd, extra = {}) => runDesxAudit({ cwd, dryRun: true, now: new Date('2026-11-04'), ...extra });
const cats = (result, category) => result.findings.filter((f) => f.category === category);

// Ten spacing samples on the 4px scale: enough data (8+) and a high enough share (90%+) to report one outlier.
const SCALE = ['4', '8', '12', '16', '20', '24', '28', '32', '36', '40'].map((n) => `.s${n}{padding:${n}px}`).join('\n');

// ---------------------------------------------------------------------------
// CLI and output safety
// ---------------------------------------------------------------------------

test('parseArgs rejects unknown flags and missing values', () => {
  assert.match(parseArgs(['--nope']).error, /Unknown option/);
  assert.match(parseArgs(['--cwd']).error, /needs a value/);
  assert.match(parseArgs(['--out', '--git']).error, /needs a value/);
  assert.match(parseArgs(['--fail-on', 'P1']).error, /only accepts P0/);
  assert.equal(parseArgs(['--git', '--dry-run']).options.dryRun, true);
});

test('--json and --dry-run write nothing', () => {
  const cwd = project({ 'a.css': '.x { color: #aaaaaa; background: #ffffff; }' });
  for (const flag of ['--json', '--dry-run']) {
    const r = cli(cwd, flag);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(fs.existsSync(path.join(cwd, 'DESIGN-AUDIT.md')), false, flag);
  }
  assert.equal(JSON.parse(cli(cwd, '--json').stdout).findings.length, 1);
});

test('bad input exits non-zero and writes nothing', () => {
  const cwd = project({ 'a.css': '.x{}' });
  const missing = path.join(cwd, 'does-not-exist');

  assert.equal(cli(cwd, '--nope').status, 2);
  assert.equal(cli(cwd, '--cwd').status, 2);
  assert.equal(cli(cwd, '--cwd', missing).status, 2);
  assert.equal(fs.existsSync(missing), false);
  assert.equal(cli(cwd, '--out', '../escaped.md').status, 2);
  assert.equal(fs.existsSync(path.join(cwd, '..', 'escaped.md')), false);
  assert.equal(fs.existsSync(path.join(cwd, 'DESIGN-AUDIT.md')), false);
});

test('--out accepts an absolute path and a path inside cwd', () => {
  const cwd = project({ 'a.css': '.x{}' });
  const abs = path.join(os.tmpdir(), `lexis-desx-out-${process.pid}.md`);
  assert.equal(cli(cwd, '--out', abs).status, 0);
  assert.ok(fs.existsSync(abs));
  assert.equal(cli(cwd, '--out', 'reports/audit.md').status, 0);
  assert.ok(fs.existsSync(path.join(cwd, 'reports', 'audit.md')));
});

test('--fail-on P0 exits 1 only when a P0 exists', () => {
  const bad = project({ 'a.css': '.x { color: #aaaaaa; background: #ffffff; }' });
  const good = project({ 'a.css': '.x { color: #000000; background: #ffffff; }' });
  assert.equal(cli(bad, '--dry-run').status, 0);
  assert.equal(cli(bad, '--dry-run', '--fail-on', 'P0').status, 1);
  assert.equal(cli(good, '--dry-run', '--fail-on', 'P0').status, 0);
});

// ---------------------------------------------------------------------------
// File selection
// ---------------------------------------------------------------------------

test('--git scans modified, staged and untracked files, and says when there are none', () => {
  const cwd = repoWithBase({ 'ui/a.html': '<h1>a</h1>\n', 'ui/b.html': '<h1>b</h1>\n' });
  const none = runDesxAudit({ cwd, git: true, dryRun: true });
  assert.match(none.note, /No changed UI files/);
  assert.equal(none.written, false);

  fs.writeFileSync(path.join(cwd, 'ui/a.html'), '<h1>a</h1><h4>skip</h4>\n'); // modified
  fs.writeFileSync(path.join(cwd, 'ui/new.html'), '<h1>n</h1><h5>skip</h5>\n'); // untracked
  fs.writeFileSync(path.join(cwd, 'ui/staged.html'), '<h2>s</h2><h6>skip</h6>\n');
  git(cwd, 'add', 'ui/staged.html');

  const files = audit(cwd, { git: true }).findings.map((f) => f.file).sort();
  assert.deepEqual(files, ['ui/a.html', 'ui/new.html', 'ui/staged.html']);
});

test('--git works from a subdirectory and scans that subtree only', () => {
  const cwd = repoWithBase({ 'ui/a.html': '<h1>a</h1>\n', 'other/o.html': '<h1>o</h1>\n' });
  fs.writeFileSync(path.join(cwd, 'ui/a.html'), '<h1>a</h1><h4>skip</h4>\n');
  fs.writeFileSync(path.join(cwd, 'other/o.html'), '<h1>o</h1><h4>skip</h4>\n');
  const files = audit(path.join(cwd, 'ui'), { git: true }).findings.map((f) => f.file);
  assert.deepEqual(files, ['a.html']);
});

test('--git works in a repository with no commits and fails outside a repository', () => {
  const cwd = project({ 'a.html': '<h1>a</h1><h4>skip</h4>\n' });
  git(cwd, 'init', '-q');
  assert.equal(audit(cwd, { git: true }).findings.length, 1);

  const plain = project({ 'a.html': '<h1>a</h1>\n' });
  assert.throws(() => audit(plain, { git: true }), /needs a git repository/);
  assert.equal(cli(plain, '--git', '--dry-run').status, 2);
});

test('--git never resolves findings of files it did not scan', () => {
  const cwd = repoWithBase({
    'ui/a.html': '<h1>a</h1><h4>skip</h4>\n',
    'ui/b.html': '<h1>b</h1>\n',
  });
  assert.equal(cli(cwd).status, 0); // full run writes the report with a.html's finding
  const reportPath = path.join(cwd, 'DESIGN-AUDIT.md');
  assert.match(fs.readFileSync(reportPath, 'utf8'), /ui\/a\.html:1/);

  fs.writeFileSync(path.join(cwd, 'ui/b.html'), '<h1>b changed</h1>\n'); // only b is touched
  assert.equal(cli(cwd, '--git').status, 0);
  const after = fs.readFileSync(reportPath, 'utf8');
  assert.match(after, /^- \[ \] `ui\/a\.html:1`/m);
  const resolved = after.slice(after.indexOf('## Resolved'));
  assert.doesNotMatch(resolved, /ui\/a\.html/);
});

test('the full scan skips ignored and fixture folders in a repository', () => {
  const cwd = project({
    'src/ok.html': '<h1>a</h1><h4>skip</h4>\n',
    'src/fixtures/f.html': '<h1>a</h1><h4>skip</h4>\n',
    'ignored/i.html': '<h1>a</h1><h4>skip</h4>\n',
    '.gitignore': 'ignored/\n',
  });
  git(cwd, 'init', '-q');
  assert.deepEqual(audit(cwd).findings.map((f) => f.file), ['src/ok.html']);
});

// ---------------------------------------------------------------------------
// Detectors
// ---------------------------------------------------------------------------

test('nesting is reported for a card inside a card, never for siblings', () => {
  const siblings = '<div class="card">one</div>\n<div class="card">two</div>';
  const nested = '<div class="card"><p>x</p><div class="panel">inner</div></div>';
  const cousins = '<section class="card"><div class="card-body">x</div></section>';
  assert.equal(findNestedCards(siblings).length, 0);
  assert.equal(findNestedCards(cousins).length, 0);
  assert.equal(findNestedCards(nested).length, 1);
  assert.equal(findNestedCards('<div class="discard"><div class="cardinal"></div></div>').length, 0);
});

test('disabled buttons: styled :disabled and dynamic bindings are not reported', () => {
  const markup = '<button class="btn">A</button>\n<button class="btn" disabled>B</button>';
  const bare = project({ 'a.html': markup });
  assert.equal(cats(audit(bare), 'states').length, 1);

  const styled = project({ 'a.html': markup, 'a.css': '.btn:disabled { opacity: .5; }' });
  assert.equal(cats(audit(styled), 'states').length, 0);

  const generic = project({ 'a.html': markup, 'a.css': 'button:disabled { opacity: .5; }' });
  assert.equal(cats(audit(generic), 'states').length, 0);

  const dynamic = project({ 'a.tsx': '<button class="btn">A</button>\n<button class="btn" disabled={busy}>B</button>' });
  assert.equal(cats(audit(dynamic), 'states').length, 0);
});

test('contrast pairs color and background of the same rule only', () => {
  const selectorOnly = project({ 'a.css': 'a[href="#abc"] { color: red; }\n#fff1 { margin: 0; }\n.u { color: #777777; background: #ffffff; }' });
  const r1 = audit(selectorOnly);
  assert.equal(cats(r1, 'contrast').length, 1); // one pair, reported once
  assert.match(cats(r1, 'contrast')[0].description, /#777777 and #ffffff/);

  const unrelated = project({ 'a.css': '.a { color: #ffffff; }\n.b { background: #ffffff; }' });
  assert.equal(cats(audit(unrelated), 'contrast').length, 0);

  const skipped = audit(project({ 'a.css': '.a { color: var(--fg); background: #fff; }\n.b { color: rgba(0,0,0,.5); background: #fff; }' }));
  assert.equal(cats(skipped, 'contrast').length, 0);
  assert.equal(skipped.coverage.contrastSkipped, 2);

  const inline = project({ 'a.html': '<p style="color:#aaaaaa;background:#ffffff">x</p>' });
  assert.equal(cats(audit(inline), 'contrast').length, 1);
});

test('scale checks ignore calc(), hairlines and pill radii', () => {
  const ignored = project({
    'a.css': `${SCALE}\n.x{padding:calc(100% - 13px)}\n.sr{margin:-1px}\n.pill{border-radius:9999px}\n.y{padding:1px}`,
  });
  assert.equal(audit(ignored).findings.length, 0);

  const real = project({ 'a.css': `${SCALE}\n.x{padding:13px}` });
  assert.equal(cats(audit(real), 'spacing').length, 1);
});

test('the report says "no data" when a category had too few samples', () => {
  const r = audit(project({ 'a.css': '.x{padding:4px}' }));
  assert.match(r.markdown, /spacing: 1 samples \(8 needed to detect a scale\): no data/);
  assert.match(r.markdown, /not analyzed: utility classes \(Tailwind\)/);
});

// ---------------------------------------------------------------------------
// Report identity and compatibility
// ---------------------------------------------------------------------------

test('moving a finding by editing lines above it changes nothing in the report', () => {
  const cwd = project({ 'ui/a.html': '<h1>a</h1><h4>skip</h4>\n' });
  assert.equal(cli(cwd).status, 0);
  const reportPath = path.join(cwd, 'DESIGN-AUDIT.md');
  const first = fs.readFileSync(reportPath, 'utf8');

  fs.writeFileSync(path.join(cwd, 'ui/a.html'), '<!-- one -->\n<!-- two -->\n<h1>a</h1><h4>skip</h4>\n');
  assert.equal(cli(cwd).status, 0);
  const second = fs.readFileSync(reportPath, 'utf8');

  assert.match(second, /ui\/a\.html:3/);
  assert.match(first, /ui\/a\.html:1/);
  assert.equal(second.slice(second.indexOf('## Resolved')), first.slice(first.indexOf('## Resolved')));
  assert.equal((second.match(/^- \[ \] `ui\/a\.html/gm) || []).length, 1);
});

test('a report written by 1.4.0 merges without loss', () => {
  const old = `# Design audit

Última corrida: 2026-09-11

## Hallazgos

### P1 — importante
- [ ] \`ui/a.html:1\` — Heading skip h1 → h3
      sugerencia: old suggestion
- [ ] \`ui/gone.html:4\` — Heading skip h2 → h4
      sugerencia: fixed since

## Resueltos en corridas anteriores
- [x] \`ui/kept.css:2\` — already done
`;
  const cwd = project({ 'ui/a.html': '<h1>a</h1><h3>skip</h3>\n', 'DESIGN-AUDIT.md': old });
  const r = runDesxAudit({ cwd, now: new Date('2026-11-04') });
  const out = fs.readFileSync(r.outPath, 'utf8');

  assert.match(out, /ui\/kept\.css:2` - already done/);
  assert.match(out, /ui\/gone\.html:4` - Heading skip h2 -> h4|ui\/gone\.html:4` - Heading skip h2 → h4/);
  assert.match(out, /\(resolved 2026-11-04\)/);
  assert.equal((out.match(/^- \[ \] `ui\/a\.html/gm) || []).length, 1);
});

// ---------------------------------------------------------------------------
// Quality rules added for slopx (desx/<rule>): a positive and a negative each
// ---------------------------------------------------------------------------

const QUALITY_CASES = [
  ['missing-alt', 'a.html', '<img src="a.png">', '<img src="a.png" alt="A chart">'],
  ['crushed-tracking', 'a.css', '.h { letter-spacing: -0.06em; }', '.h { letter-spacing: -0.02em; }'],
  ['gray-on-color', 'a.css', '.w { color: #888888; background: #e63946; }', '.w { color: #ffffff; background: #e63946; }'],
  ['tiny-text', 'a.css', 'p { font-size: 10px; }', 'p { font-size: 14px; }'],
  ['tight-line-height', 'a.css', 'p { line-height: 1.1; }', 'p { line-height: 1.5; }'],
  ['justified-text', 'a.css', '.x { text-align: justify; }', '.x { text-align: left; }'],
  ['all-caps-body', 'a.css', 'p { text-transform: uppercase; }', '.label { text-transform: uppercase; }'],
  ['wide-body-tracking', 'a.css', 'p { letter-spacing: 0.2em; }', '.label { letter-spacing: 0.2em; }'],
];

for (const [rule, file, positive, negative] of QUALITY_CASES) {
  test(`desx/${rule} fires on the positive case and not on the negative one`, () => {
    const hit = audit(project({ [file]: positive }));
    assert.ok(hit.findings.some((f) => f.rule === rule), `${rule} not reported for: ${positive}`);
    const clean = audit(project({ [file]: negative }));
    assert.ok(!clean.findings.some((f) => f.rule === rule), `${rule} reported for: ${negative}`);
  });
}

test('every desx finding carries a stable rule id', () => {
  const result = audit(project({ 'a.css': '.c { color: #aaaaaa; background: #ffffff; }', 'a.html': '<h1>a</h1><h3>b</h3>' }));
  assert.ok(result.findings.length >= 2);
  for (const finding of result.findings) assert.match(finding.rule, /^[a-z-]+$/);
});

test('runDesxAudit scans exactly the files it is given', () => {
  const cwd = project({ 'a.css': '.c { color: #aaaaaa; background: #ffffff; }', 'b.css': '.c { color: #bbbbbb; background: #ffffff; }' });
  const result = runDesxAudit({ cwd, files: [path.join(cwd, 'a.css')], dryRun: true });
  assert.deepEqual([...new Set(result.findings.map((f) => f.file))], ['a.css']);
});
