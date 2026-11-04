#!/usr/bin/env node

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const { runSlopxAudit, parseWaivers, globToRegExp } = require('../scripts/slopx-audit');
const { RULES, BY_ID, publicRule } = require('../scripts/slopx-rules');
const { runDesxAudit } = require('../scripts/desx-audit');

const script = path.join(__dirname, '..', 'scripts', 'slopx-audit.js');
const GOLDEN_DIR = path.join(__dirname, 'fixtures', 'slopx');

// Characters are built from code points so this file holds no emoji and no escape sequences.
const ROCKET = String.fromCodePoint(0x1f680);
const EM = String.fromCharCode(0x2014);
const NUL = String.fromCharCode(0);

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function write(cwd, files) {
  for (const [name, content] of Object.entries(files)) {
    const abs = path.join(cwd, name);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
  }
}

function git(cwd, ...args) {
  const r = spawnSync('git', ['-c', 'user.email=t@t.t', '-c', 'user.name=t', '-c', 'commit.gpgsign=false', ...args], { cwd, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
}

// A repo whose base commit holds `files`. Later writes are the "change" under audit.
function repo(files = { 'README.md': 'base\n' }) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-slopx-'));
  git(cwd, 'init', '-q');
  write(cwd, files);
  git(cwd, 'add', '-A');
  git(cwd, 'commit', '-q', '-m', 'base');
  return cwd;
}

const cli = (cwd, ...args) => spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8' });
const audit = (cwd, options = {}) => runSlopxAudit({ cwd, ...options });
const idsOf = (result) => result.findings.map((f) => f.id);
const status = (cwd) => git(cwd, 'status', '--porcelain');

// ---------------------------------------------------------------------------
// registry
// ---------------------------------------------------------------------------

test('the registry has unique ids, suggestions, and known owners, passes and handoffs', () => {
  const handoffs = new Set([null, 'clarify', 'layout', 'typeset', 'colorize', 'distill', 'polish', 'quieter']);
  assert.equal(new Set(RULES.map((r) => r.id)).size, RULES.length);
  for (const rule of RULES) {
    assert.match(rule.id, /^(code|copy|look|desx|slopx)\/[a-z-]+$/, rule.id);
    assert.ok(['warning', 'advisory'].includes(rule.severity), rule.id);
    assert.ok(['immediate', 'deferred'].includes(rule.tier), rule.id);
    assert.ok(['code', 'copy', 'look', 'quality'].includes(rule.pass), rule.id);
    assert.equal(rule.owner, rule.id.startsWith('desx/') ? 'desx' : 'slopx', rule.id);
    assert.ok(rule.suggestion && rule.description, rule.id);
    assert.ok(handoffs.has(rule.handoff), `${rule.id}: ${rule.handoff}`);
  }
  assert.equal(RULES.filter((r) => r.id.startsWith('look/') && r.pass !== 'look').length, 0);
});

test('every rule id the desx detector can emit is in the registry', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-slopx-desx-'));
  write(cwd, {
    'a.css': [
      '.hero { letter-spacing: -0.06em; }',
      'p { font-size: 10px; line-height: 1.1; text-align: justify; text-transform: uppercase; letter-spacing: 0.2em; }',
      '.w { color: #888888; background: #e63946; }',
      '.c { color: #aaaaaa; background: #ffffff; }',
      ...['4', '8', '12', '16', '20', '24', '28', '32', '36', '40'].map((n) => `.s${n}{padding:${n}px;border-radius:${n}px}`),
      '.x{padding:13px;border-radius:13px}',
      '.f1{font-size:11px}.f2{font-size:13px}.f3{font-size:15px}.f4{font-size:17px}.f5{font-size:19px}',
    ].join('\n'),
    'a.html':
      '<h1>a</h1><h3>b</h3><img src="a.png"><div class="card"><div class="card"></div></div>' +
      '<button class="b">x</button><button class="b" disabled>y</button>',
  });
  const emitted = new Set(runDesxAudit({ cwd, dryRun: true }).findings.map((f) => `desx/${f.rule}`));
  for (const id of emitted) assert.ok(BY_ID.has(id), `${id} missing from the registry`);
  for (const id of BY_ID.keys()) {
    if (id.startsWith('desx/')) assert.ok(emitted.has(id), `${id} is not produced by the detector in this fixture`);
  }
});

test('ownership is disjoint: /desx alone reports nothing from look/*', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-slopx-own-'));
  write(cwd, {
    'a.css': '.card { border-left: 4px solid #3b82f6; box-shadow: 4px 4px 0 #000; font-family: Inter, sans-serif; }\n.t { background: linear-gradient(90deg,#f00,#00f); -webkit-background-clip: text; }\n',
  });
  const rules = runDesxAudit({ cwd, dryRun: true }).findings.map((f) => f.rule);
  assert.equal(rules.filter((r) => r.startsWith('side-tab') || r.startsWith('gradient-text') || r.startsWith('hard-offset')).length, 0);
  assert.equal(audit(cwd, { all: true }).findings.filter((f) => f.owner === 'desx' && f.id.startsWith('look/')).length, 0);
});

// ---------------------------------------------------------------------------
// rules: one positive and one negative each (new, untracked files)
// ---------------------------------------------------------------------------

const CASES = [
  // code
  ['code/marker', 'src/a.js', '// TODO: finish this\n', 'const todoList = [];\n'],
  ['code/marker', 'src/a.js', '// rest of the code here\n', '// explains the retry policy\n'],
  ['code/debug-leftover', 'src/a.js', 'debugger;\n', 'const debuggerName = 1;\n'],
  ['code/debug-leftover', 'src/a.js', 'console.log(1);\n', 'const log = console;\n'],
  ['code/commented-out-code', 'src/a.js', '// const a = 1;\n// foo.bar(2);\n', '// one commented line only\n// then a note for readers\n'],
  ['code/compat-cruft', 'src/a.js', '// removed old handler\n', '/** @deprecated use b */\nfunction _unused(_a) {}\n'],
  ['code/empty-catch', 'src/a.js', 'try { f(); } catch (e) {}\n', 'try { f(); } catch (e) { /* safe to ignore */ }\n'],
  ['code/narrating-comment', 'src/a.js', '// set user name\nsetUserName(x);\n', '// retries because the API is flaky\nretry(3);\n'],
  // copy
  ['copy/emoji', 'src/a.tsx', `export const A = () => <p>Launch ${ROCKET}</p>;\n`, 'export const A = () => <p>(c) 2026 -> next</p>;\n'],
  ['copy/placeholder-text', 'src/a.tsx', 'export const A = () => <p>Lorem ipsum dolor</p>;\n', 'export const A = () => <p>Invoices due this month</p>;\n'],
  ['copy/stock-vocabulary', 'src/a.tsx', 'export const A = () => <p>A seamless experience</p>;\n', 'export const A = () => <p>Syncs in under a second</p>;\n'],
  ['copy/generic-claim', 'src/a.tsx', 'export const A = () => <h1>World-class platform</h1>;\n', 'export const A = () => <h1>Billing for small teams</h1>;\n'],
  ['copy/filler-framing', 'src/a.tsx', "export const A = () => <p>In today's world</p>;\n", 'export const A = () => <p>Start here</p>;\n'],
  ['copy/forced-contrast', 'src/a.tsx', "export const A = () => <p>Not just a tool, it's a team</p>;\n", 'export const A = () => <p>A tool for the team</p>;\n'],
  ['copy/em-dash-overuse', 'src/a.tsx', `export const A = () => <p>One ${EM} two ${EM} three</p>;\n`, `export const A = () => <p>One ${EM} two</p>;\n`],
  ['copy/generic-label', 'src/a.tsx', 'export const A = () => <button>Submit</button>;\n', 'export const A = () => <button>Save invoice</button>;\n'],
  ['copy/generic-error', 'src/a.tsx', 'export const A = () => <p>Something went wrong</p>;\n', 'export const A = () => <p>Could not save: the file is locked</p>;\n'],
  ['copy/unsupported-claim', 'src/a.tsx', 'export const A = () => <p>Trusted by 10,000+ users</p>;\n', 'export const A = () => <p>Used by our own team</p>;\n'],
  ['copy/repeated-text', 'src/a.html', '<div><h3>Fast offline sync</h3><p>Fast offline sync</p></div>\n', '<div><h3>Fast offline sync</h3><p>Works without a connection</p></div>\n'],
  ['copy/exclamation-run', 'src/a.tsx', 'export const A = () => <p>Great!!</p>;\n', 'export const A = () => <p>Great!</p>;\n'],
  ['copy/theater', 'src/a.tsx', 'export const A = () => <p>Security theater</p>;\n', 'export const A = () => <p>Security review</p>;\n'],
  // look
  ['look/side-tab', 'src/a.css', '.card { border-left: 4px solid #3b82f6; }\n', '.card { border-left: 1px solid #cccccc; }\n.nav { border-left: 4px solid red; }\n'],
  ['look/gradient-text', 'src/a.css', '.t { background: linear-gradient(90deg, #f00, #00f); -webkit-background-clip: text; color: transparent; }\n', '.t { background: linear-gradient(90deg, #f00, #00f); }\n'],
  ['look/hard-offset-shadow', 'src/a.css', '.c { box-shadow: 4px 4px 0 #000000; }\n', '.c { box-shadow: 0 1px 0 #ffffff; }\n.d { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }\n'],
  ['look/bounce-easing', 'src/a.css', '.a { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }\n', '.a { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }\n'],
  ['look/eyebrow', 'src/a.html', '<span class="eyebrow">New</span><h2>Title</h2>\n', '<span class="label">New</span><h2>Title</h2>\n'],
  ['look/placeholder-image', 'src/a.html', '<img src="" alt="">\n', '<img src="/a.png" alt="A chart">\n'],
  ['look/placeholder-image', 'src/a.html', '<img src="https://via.placeholder.com/150" alt="x">\n', '<img src="https://cdn.example.com/a.png" alt="x">\n'],
  ['look/ghost-card', 'src/a.css', '.card { border: 1px solid #dddddd; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }\n', '.card { border: 1px solid #dddddd; }\n'],
  ['look/extreme-radius', 'src/a.css', '.card { border-radius: 32px; }\n', '.card { border-radius: 12px; }\n.pill { border-radius: 9999px; }\n'],
  ['look/border-accent-rounded', 'src/a.css', '.box { border: 4px solid #ff0000; border-radius: 12px; }\n', '.box { border: 1px solid #ff0000; border-radius: 12px; }\n'],
  ['look/glass-everywhere', 'src/a.css', '.a{backdrop-filter:blur(8px)}\n.b{backdrop-filter:blur(8px)}\n.c{backdrop-filter:blur(8px)}\n', '.a{backdrop-filter:blur(8px)}\n.b{backdrop-filter:blur(8px)}\n'],
  ['look/stripe-gradient', 'src/a.css', '.s { background: repeating-linear-gradient(45deg, #eee, #eee 4px, #fff 4px, #fff 8px); }\n', '.s { background: linear-gradient(#eee, #fff); }\n'],
  ['look/glow-shadow', 'src/a.css', '.b { box-shadow: 0 0 24px #7c3aed; }\n', '.b { box-shadow: 0 0 24px rgba(0,0,0,0.2); }\n'],
  ['look/ai-palette', 'src/a.css', '.h { background: linear-gradient(135deg, #7c3aed, #3b82f6); }\n', '.h { background: linear-gradient(135deg, #111111, #222222); }\n'],
  ['look/overused-font', 'src/a.css', 'body { font-family: Inter, sans-serif; }\n', 'body { font-family: Georgia, serif; }\n'],
  ['look/marquee-blink', 'src/a.html', '<marquee>News</marquee>\n', '<p>News</p>\n'],
  ['look/numbered-label', 'src/a.html', '<span>01</span><h3>Plan</h3>\n', '<span>New</span><h3>Plan</h3>\n'],
  ['look/pulsing-dot', 'src/a.css', '.status-dot { animation: pulse 2s infinite; }\n', '.status-dot { animation: fade 2s 1; }\n'],
  // quality (through the desx detector)
  ['desx/missing-alt', 'src/a.html', '<img src="a.png">\n', '<img src="a.png" alt="">\n'],
  ['desx/crushed-tracking', 'src/a.css', '.h { letter-spacing: -0.06em; }\n', '.h { letter-spacing: -0.01em; }\n'],
  ['desx/gray-on-color', 'src/a.css', '.w { color: #888888; background: #e63946; }\n', '.w { color: #ffffff; background: #e63946; }\n'],
  ['desx/tiny-text', 'src/a.css', 'p { font-size: 10px; }\n', 'p { font-size: 14px; }\n'],
  ['desx/tight-line-height', 'src/a.css', 'p { line-height: 1.1; }\n', 'p { line-height: 1.5; }\n'],
  ['desx/justified-text', 'src/a.css', '.x { text-align: justify; }\n', '.x { text-align: left; }\n'],
  ['desx/all-caps-body', 'src/a.css', 'p { text-transform: uppercase; }\n', '.label { text-transform: uppercase; }\n'],
  ['desx/wide-body-tracking', 'src/a.css', 'p { letter-spacing: 0.2em; }\n', '.label { letter-spacing: 0.2em; }\n'],
  ['desx/contrast', 'src/a.css', '.c { color: #aaaaaa; background: #ffffff; }\n', '.c { color: #000000; background: #ffffff; }\n'],
  ['desx/heading-skip', 'src/a.html', '<h1>a</h1><h3>b</h3>\n', '<h1>a</h1><h2>b</h2>\n'],
  ['desx/nested-cards', 'src/a.html', '<div class="card"><div class="card">x</div></div>\n', '<div class="card">a</div><div class="card">b</div>\n'],
  ['desx/button-states', 'src/a.html', '<button class="b">x</button><button class="b" disabled>y</button>\n', '<button class="b">x</button><button class="b">y</button>\n'],
];

// All cases live in one plain directory (one audit, no git): case-<n>/pos/<file> and case-<n>/neg/<file>.
let caseRun;
function runCases() {
  if (!caseRun) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-slopx-cases-'));
    CASES.forEach(([, file, positive, negative], i) => {
      write(dir, { [`case-${i}/pos/${file}`]: positive, [`case-${i}/neg/${file}`]: negative });
    });
    caseRun = audit(dir, { all: true });
  }
  return caseRun;
}

CASES.forEach(([rule, file, positive, negative], i) => {
  test(`${rule} reports ${path.extname(file)} content and stays quiet on the clean twin (${positive.slice(0, 24).trim()})`, () => {
    const found = (side) => runCases().findings.filter((f) => f.file.startsWith(`case-${i}/${side}/`)).map((f) => f.id);
    assert.ok(found('pos').includes(rule), `${rule} not reported for: ${positive}`);
    assert.ok(!found('neg').includes(rule), `${rule} reported for: ${negative}`);
  });
});

test('copy/prose-* rules run only with --prose, in Markdown, outside code', () => {
  const cwd = repo();
  write(cwd, {
    'docs/a.md': ['In summary, a seamless tool.', `One ${EM} two.`, "It's not just fast, it's calm.", 'In today\'s world we ship.', '```', 'seamless in code', '```', ''].join('\n'),
  });
  assert.equal(idsOf(audit(cwd)).filter((id) => id.startsWith('copy/prose')).length, 0);
  const found = new Set(idsOf(audit(cwd, { prose: true })));
  for (const id of ['copy/prose-vocabulary', 'copy/prose-framing', 'copy/prose-contrast', 'copy/prose-dash']) assert.ok(found.has(id), id);
  const fenced = audit(cwd, { prose: true }).findings.filter((f) => f.line >= 5 && f.line <= 7);
  assert.equal(fenced.length, 0, 'fenced code is not prose');
});

test('unsupported-claim also catches placeholder people in an i18n file', () => {
  const cwd = repo();
  write(cwd, { 'src/i18n/en.json': '{ "owner": "John Doe" }\n' });
  assert.ok(idsOf(audit(cwd)).includes('copy/unsupported-claim'));
});

// ---------------------------------------------------------------------------
// scope: diff lines, untracked files, --all, --base
// ---------------------------------------------------------------------------

test('a clean change reports nothing, and all four passes appear in the report', () => {
  const cwd = repo({ 'src/a.js': 'const a = 1;\n' });
  write(cwd, { 'src/a.js': 'const a = 1;\nconst b = 2;\n' });
  const result = audit(cwd);
  assert.deepEqual(result.findings, []);
  assert.deepEqual(result.passes.map((p) => p.pass), ['code', 'copy', 'look', 'quality']);
  assert.equal(cli(cwd).status, 0);
});

test('a change with no UI files says so for look and quality, and does not fail', () => {
  const cwd = repo({ 'src/a.js': 'const a = 1;\n' });
  write(cwd, { 'src/a.js': 'const a = 1;\nconst b = 2;\n' });
  const result = audit(cwd);
  const notes = Object.fromEntries(result.passes.map((p) => [p.pass, p.note]));
  assert.equal(notes.look, 'no UI files in scope');
  assert.equal(notes.quality, 'no UI files in scope');
  assert.equal(notes.code, undefined);
  assert.match(cli(cwd).stdout, /look\s+0\s+\(no UI files in scope\)/);
});

test('only added lines are checked by the code and copy passes; legacy slop is not reported', () => {
  const cwd = repo({ 'src/a.js': '// TODO: old\nconst a = 1;\ntry { x(); } catch (e) {}\n' });
  write(cwd, { 'src/a.js': '// TODO: old\nconst a = 1;\ntry { x(); } catch (e) {}\n// TODO: new\n' });
  const result = audit(cwd);
  assert.deepEqual(result.findings.map((f) => [f.id, f.line]), [['code/marker', 4]]);
});

test('look findings in a changed file are marked file-level when the line was not touched', () => {
  const cwd = repo({ 'src/a.css': '.card { border-left: 4px solid #3b82f6; }\n' });
  write(cwd, { 'src/a.css': '.card { border-left: 4px solid #3b82f6; }\n.x { color: #000; }\n' });
  const finding = audit(cwd).findings.find((f) => f.id === 'look/side-tab');
  assert.ok(finding);
  assert.equal(finding.fileLevel, true);
  const fresh = repo();
  write(fresh, { 'src/a.css': '.card { border-left: 4px solid #3b82f6; }\n' });
  assert.equal(audit(fresh).findings.find((f) => f.id === 'look/side-tab').fileLevel, false);
});

test('--all scans files that did not change', () => {
  const cwd = repo({ 'src/a.js': '// TODO: old\n' });
  assert.equal(audit(cwd).findings.length, 0);
  assert.deepEqual(idsOf(audit(cwd, { all: true })), ['code/marker']);
});

test('--base compares against merge-base(ref, HEAD)', () => {
  const cwd = repo({ 'src/a.js': 'const a = 1;\n' });
  const baseBranch = git(cwd, 'rev-parse', '--abbrev-ref', 'HEAD').trim();
  git(cwd, 'checkout', '-q', '-b', 'feature');
  write(cwd, { 'src/a.js': 'const a = 1;\n// TODO: later\n' });
  git(cwd, 'add', '-A');
  git(cwd, 'commit', '-q', '-m', 'work');
  assert.equal(audit(cwd).findings.length, 0, 'the work is committed, so HEAD sees no change');
  const result = audit(cwd, { base: baseBranch });
  assert.deepEqual(idsOf(result), ['code/marker']);
});

test('a repo with no commits, a non-ASCII file name, CRLF endings and an untracked symlink all run', (t) => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-slopx-edge-'));
  git(cwd, 'init', '-q');
  write(cwd, { 'src/ñandú.js': '// TODO: x\r\nconst a = 1;\r\n', 'secret.txt': 'do not read\n' });
  try {
    fs.symlinkSync(path.join(cwd, 'secret.txt'), path.join(cwd, 'link.js'));
  } catch {
    t.diagnostic('symlink creation is not permitted here; symlink case skipped');
  }
  const result = audit(cwd);
  assert.deepEqual(result.findings.map((f) => [f.id, f.file]), [['code/marker', 'src/ñandú.js']]);
  assert.equal(result.findings.some((f) => f.file === 'link.js'), false);
});

test('large files, binary files and generated paths are skipped', () => {
  const cwd = repo();
  write(cwd, {
    'src/big.js': `// TODO: x\n${'x'.repeat(1024 * 1024 + 10)}\n`,
    'src/bin.js': `// TODO: x\n${NUL}\n`,
    'dist/a.js': '// TODO: x\n',
    'src/a.min.js': '// TODO: x\n',
    'src/types.d.ts': '// TODO: x\n',
    'package-lock.json': '{ "x": "TODO" }\n',
  });
  assert.equal(audit(cwd).findings.length, 0);
});

test('output never contains the flagged line and a run writes nothing', () => {
  const cwd = repo();
  write(cwd, { 'src/a.js': 'console.log("sk-live-VERY-SECRET-123");\n// TODO: sk-live-VERY-SECRET-123\n', 'src/a.css': '.card { border-left: 4px solid #3b82f6; }\n' });
  const before = status(cwd);
  for (const args of [[], ['--json'], ['--github']]) {
    const out = cli(cwd, ...args);
    assert.doesNotMatch(out.stdout + out.stderr, /VERY-SECRET/);
  }
  assert.equal(status(cwd), before);
  assert.equal(fs.existsSync(path.join(cwd, 'DESIGN-AUDIT.md')), false);
  assert.equal(fs.existsSync(path.join(cwd, 'docs', 'DESIGN-AUDIT.md')), false);
});

// ---------------------------------------------------------------------------
// conventions and exemptions
// ---------------------------------------------------------------------------

test('console.log is left alone in CLIs, in files that already log, and in tests', () => {
  const cwd = repo({ 'src/logs.js': 'console.error("existing");\nconst a = 1;\n' });
  write(cwd, {
    'src/logs.js': 'console.error("existing");\nconst a = 1;\nconsole.log("added");\n',
    'scripts/tool.js': 'console.log("cli output");\n',
    'bin/tool.js': 'console.log("cli output");\n',
    'src/shebang.js': '#!/usr/bin/env node\nconsole.log("cli output");\n',
    'src/a.test.js': 'console.log("test"); // ' + ROCKET + '\n',
  });
  assert.equal(audit(cwd).findings.length, 0);
});

test('waivers: all three forms, comma lists and *, and a waiver with no reason is reported and not applied', () => {
  const cwd = repo();
  write(cwd, {
    'src/a.js': [
      'debugger; // slopx-disable-line code/debug-leftover: needed while we debug the worker',
      '// slopx-disable-next-line code/debug-leftover: same reason',
      'debugger;',
      'debugger;',
    ].join('\n') + '\n',
    'src/b.js': '// slopx-disable code/marker, code/debug-leftover: generated sample\n// TODO: a\ndebugger;\n',
    'src/c.js': '// slopx-disable *: vendored snippet\n// TODO: a\ndebugger;\n',
    'src/d.js': '// slopx-disable-next-line code/marker\n// TODO: still reported\n',
  });
  const result = audit(cwd);
  const byFile = (f) => result.findings.filter((x) => x.file === f).map((x) => [x.id, x.line]);
  assert.deepEqual(byFile('src/a.js'), [['code/debug-leftover', 4]]);
  assert.deepEqual(byFile('src/b.js'), []);
  assert.deepEqual(byFile('src/c.js'), []);
  assert.deepEqual(byFile('src/d.js'), [['slopx/waiver-without-reason', 1], ['code/marker', 2]]);
  assert.equal(audit(cwd, { noInlineIgnores: true }).findings.some((f) => f.file === 'src/b.js'), true);
});

test('waivers also work in CSS and HTML comments, and for desx rules', () => {
  const cwd = repo();
  write(cwd, {
    'src/a.css': '/* slopx-disable-next-line look/side-tab: brand callout */\n.card { border-left: 4px solid #3b82f6; }\n',
    'src/a.html': '<!-- slopx-disable desx/missing-alt: decorative sprite -->\n<img src="a.png">\n',
  });
  assert.deepEqual(audit(cwd).findings, []);
});

test('// lexis: exempts its line', () => {
  const cwd = repo();
  write(cwd, { 'src/a.js': 'debugger; // lexis: kept on purpose until the worker is stable\n' });
  assert.equal(audit(cwd).findings.length, 0);
});

test('parseWaivers reads the three forms and flags missing reasons', () => {
  const { wide, byLine, withoutReason } = parseWaivers([
    '// slopx-disable copy/emoji: brand',
    'x // slopx-disable-line code/marker: why',
    '// slopx-disable-next-line code/empty-catch: why',
    'y',
    '// slopx-disable code/marker',
    '<!-- slopx-disable-line look/side-tab: ok -->',
  ]);
  assert.deepEqual([...wide], ['copy/emoji']);
  assert.ok(byLine.get(2).has('code/marker'));
  assert.ok(byLine.get(4).has('code/empty-catch'));
  assert.ok(byLine.get(6).has('look/side-tab'));
  assert.deepEqual(withoutReason, [5]);
});

test('globToRegExp matches * within a segment, ** across segments, and bare names anywhere', () => {
  assert.ok(globToRegExp('scripts/*.js').test('scripts/a.js'));
  assert.ok(!globToRegExp('scripts/*.js').test('scripts/x/a.js'));
  assert.ok(globToRegExp('docs/**').test('docs/a/b.md'));
  assert.ok(globToRegExp('a.js').test('src/deep/a.js'));
});

// ---------------------------------------------------------------------------
// .slopx.json
// ---------------------------------------------------------------------------

test('.slopx.json ignores a rule, a file glob and a value, each with a reason', () => {
  const cwd = repo();
  write(cwd, {
    'src/a.js': '// TODO: a\ndebugger;\n',
    'vendor/b.js': '// TODO: b\n',
    'src/c.tsx': `export const A = () => <p>${ROCKET}</p>;\nexport const B = () => <p>${String.fromCodePoint(0x1f389)}</p>;\n`,
  });
  assert.equal(audit(cwd).findings.length, 5, 'two markers, a debugger and two emojis, before the config');
  write(cwd, {
    '.slopx.json': JSON.stringify({
      ignoreRules: [{ rule: 'code/debug-leftover', reason: 'worker debugging' }],
      ignoreFiles: [{ glob: 'vendor/**', reason: 'vendored' }],
      ignoreValues: [{ rule: 'copy/emoji', value: ROCKET, reason: 'brand mark' }],
    }),
  });
  const result = audit(cwd);
  assert.deepEqual(result.findings.filter((f) => f.file === 'src/a.js').map((f) => f.id), ['code/marker']);
  assert.equal(result.findings.some((f) => f.file === 'vendor/b.js'), false);
  assert.deepEqual(result.findings.filter((f) => f.id === 'copy/emoji').map((f) => f.ignoreValue), [String.fromCodePoint(0x1f389)]);
  assert.ok(audit(cwd, { noConfig: true }).findings.some((f) => f.file === 'vendor/b.js'));
});

test('.slopx.local.json adds to the shared config', () => {
  const cwd = repo();
  write(cwd, {
    'src/a.js': 'debugger;\n// TODO: a\n',
    '.slopx.json': JSON.stringify({ ignoreRules: [{ rule: 'code/marker', reason: 'tracked elsewhere' }] }),
    '.slopx.local.json': JSON.stringify({ ignoreRules: [{ rule: 'code/debug-leftover', reason: 'my machine' }] }),
  });
  assert.equal(audit(cwd).findings.length, 0);
});

test('a bad config fails with a readable message and exit 1', () => {
  const bad = [
    ['{ nope', /not valid JSON/],
    [JSON.stringify({ ignoreRules: [{ rule: 'code/marker' }] }), /needs a non-empty "reason"/],
    [JSON.stringify({ ignoreRules: [{ rule: 'code/nope', reason: 'x' }] }), /unknown rule/],
    [JSON.stringify({ ignoreFiles: [{ glob: '../x', reason: 'x' }] }), /stay inside the repository/],
    [JSON.stringify({ advisoryRules: 'maybe' }), /advisoryRules/],
  ];
  for (const [content, pattern] of bad) {
    const cwd = repo();
    write(cwd, { '.slopx.json': content });
    const r = cli(cwd);
    assert.equal(r.status, 1, content);
    assert.match(r.stderr, pattern);
    assert.doesNotMatch(r.stderr, /at .*\.js:\d+/, 'no stack trace');
  }
});

test('advisoryRules "exclude" behaves like --no-advisory', () => {
  const cwd = repo();
  write(cwd, { 'src/a.tsx': 'export const A = () => <p>A seamless experience</p>;\n', '.slopx.json': JSON.stringify({ advisoryRules: 'exclude' }) });
  assert.equal(audit(cwd).findings.length, 0);
});

// ---------------------------------------------------------------------------
// CLI contract
// ---------------------------------------------------------------------------

test('exit codes: 0 clean, 0 advisory only, 2 with a warning, 1 on bad input', () => {
  const clean = repo();
  assert.equal(cli(clean).status, 0);

  const advisory = repo();
  write(advisory, { 'src/a.tsx': 'export const A = () => <p>A seamless experience</p>;\n' });
  assert.equal(cli(advisory).status, 0);
  assert.match(cli(advisory).stdout, /advisory/);
  assert.doesNotMatch(cli(advisory, '--no-advisory').stdout, /copy\/stock-vocabulary/);

  const warning = repo();
  write(warning, { 'src/a.js': 'debugger;\n' });
  assert.equal(cli(warning).status, 2);

  assert.equal(cli(clean, '--nope').status, 1);
  assert.equal(cli(clean, '--base').status, 1);
  assert.equal(cli(clean, '--base', 'no-such-ref').status, 1);
  assert.match(cli(clean, '--base', 'no-such-ref').stderr, /not a commit/);
});

test('--json, --github, --quiet and conflicting flags', () => {
  const cwd = repo();
  write(cwd, { 'src/a.js': 'debugger;\n', 'src/a.tsx': 'export const A = () => <p>A seamless experience</p>;\n' });

  const json = JSON.parse(cli(cwd, '--json').stdout);
  assert.deepEqual(json.passes.map((p) => p.pass), ['code', 'copy', 'look', 'quality']);
  const finding = json.findings.find((f) => f.id === 'code/debug-leftover');
  for (const key of ['id', 'name', 'description', 'severity', 'pass', 'category', 'owner', 'file', 'line', 'fileLevel', 'suggestion', 'handoff']) {
    assert.ok(key in finding, key);
  }

  const github = cli(cwd, '--github').stdout.trim().split('\n');
  assert.ok(github.includes('::warning file=src/a.js,line=1,title=code/debug-leftover::[code/debug-leftover] ' + finding.description));
  assert.ok(github.some((l) => l.startsWith('::notice file=src/a.tsx')));

  const quiet = cli(cwd, '--quiet');
  assert.equal(quiet.stdout, '');
  assert.match(quiet.stderr, /^slopx: 2 findings \(1 warning, 1 advisory\)/);

  assert.equal(cli(cwd, '--github', '--json').status, 1);
  assert.equal(cli(cwd, '--github', '--list-rules').status, 1);
});

test('--list-rules prints the registry without scanning', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-slopx-list-'));
  const ids = cli(cwd, '--list-rules', '--quiet').stdout.trim().split('\n');
  assert.deepEqual(ids, RULES.map((r) => r.id));
  const json = JSON.parse(cli(cwd, '--list-rules', '--json').stdout);
  assert.deepEqual(json, JSON.parse(JSON.stringify(RULES.map(publicRule))));
  const plain = cli(cwd, '--list-rules');
  assert.equal(plain.status, 0);
  assert.match(plain.stdout, new RegExp(`${RULES.length} rules\\.`));
});

test('outside a git repository it fails, and --all still works', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-slopx-nogit-'));
  write(cwd, { 'a.js': 'debugger;\n' });
  const failed = cli(cwd);
  assert.equal(failed.status, 1);
  assert.match(failed.stderr, /not a git repository/);
  assert.equal(cli(cwd, '--all').status, 2);
  assert.equal(cli(cwd, '--all', '--cwd', path.join(cwd, 'missing')).status, 1);
});

// ---------------------------------------------------------------------------
// golden output
// ---------------------------------------------------------------------------

function goldenRepo() {
  const cwd = repo({ 'README.md': 'base\n' });
  write(cwd, {
    'src/a.js': '// TODO: finish\nconsole.log(1);\n',
    'src/a.tsx': 'export const A = () => <p>A seamless experience</p>;\n',
    'src/a.css': '.card { border-left: 4px solid #3b82f6; }\n.c { color: #aaaaaa; background: #ffffff; }\n',
  });
  return cwd;
}

function golden(name, actual) {
  const file = path.join(GOLDEN_DIR, name);
  if (process.env.UPDATE_GOLDEN === '1') {
    fs.mkdirSync(GOLDEN_DIR, { recursive: true });
    fs.writeFileSync(file, actual);
  }
  assert.equal(actual, fs.readFileSync(file, 'utf8'), `${name} changed; rerun with UPDATE_GOLDEN=1 if the change is intended`);
}

test('plain output is pinned by a golden file', () => {
  golden('plain.txt', cli(goldenRepo()).stdout.replace(/\r\n/g, '\n'));
});

test('JSON output is pinned by a golden file', () => {
  golden('output.json', cli(goldenRepo(), '--json').stdout.replace(/\r\n/g, '\n'));
});

// ---------------------------------------------------------------------------
// docs
// ---------------------------------------------------------------------------

function rulesTable() {
  const rows = RULES.map(publicRule).map((r) => {
    const tier = `${r.tier}${r.tier2 ? ', tier 2' : ''}${r.optIn ? `, ${r.optIn}` : ''}`;
    return `| \`${r.id}\` | ${r.owner} | ${r.severity} | ${tier} | ${r.description} |`;
  });
  return ['| Id | Owner | Severity | Tier | What it catches |', '| --- | --- | --- | --- | --- |', ...rows].join('\n');
}

test('docs/slopx.md rule table is the registry, and its handoff table covers every handoff in use', () => {
  const file = path.join(__dirname, '..', 'docs', 'slopx.md');
  const doc = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const block = `<!-- rules:start -->\n${rulesTable()}\n<!-- rules:end -->`;
  if (process.env.UPDATE_DOCS === '1') {
    fs.writeFileSync(file, doc.replace(/<!-- rules:start -->[\s\S]*<!-- rules:end -->/, () => block));
  }
  const current = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  assert.ok(current.includes(block), 'rule table is out of date; run with UPDATE_DOCS=1 to regenerate');

  for (const handoff of new Set(RULES.map((r) => r.handoff).filter(Boolean))) {
    assert.ok(current.includes(`| \`${handoff}\` |`), `handoff "${handoff}" has no row in the handoff table`);
  }
});

test('the positioning text no longer calls desx a slop detector', () => {
  const root = path.join(__dirname, '..');
  const files = ['AGENTS.md', 'README.md', 'DESX.md', 'docs/specxis.md', 'skills/desx/SKILL.md', 'commands/desx.toml', 'pi-extension/index.js', 'site/src/i18n/en.ts', 'site/src/i18n/es.ts', '.windsurf/rules/lexis-two.md', '.clinerules/lexis-two.md', '.kiro/steering/lexis-two.md', '.cursor/rules/lexis-two.mdc'];
  for (const rel of files) {
    const text = fs.readFileSync(path.join(root, rel), 'utf8');
    assert.doesNotMatch(text, /visual slop/i, `${rel} still says "visual slop"`);
  }
});

// ---------------------------------------------------------------------------
// precision fixes found by the calibration run on this repository
// ---------------------------------------------------------------------------

test('phrase rules ignore CSS identifiers, style blocks, scripts and Astro frontmatter', () => {
  const cwd = repo();
  write(cwd, {
    'src/a.astro': [
      '---',
      "const note = 'a seamless shortcut in code';",
      '---',
      '<div style="background: var(--bg-elevated); color: red">Plain text</div>',
      '<style>',
      '  .x { background: var(--bg-elevated); }',
      '</style>',
      '<script>',
      "  const s = 'robust';",
      '</script>',
      '',
    ].join('\n'),
  });
  assert.deepEqual(idsOf(audit(cwd)).filter((id) => id.startsWith('copy/')), []);

  const real = repo();
  write(real, { 'src/a.astro': '---\nconst x = 1;\n---\n<p>A seamless, robust tool</p>\n' });
  assert.ok(idsOf(audit(real)).includes('copy/stock-vocabulary'));
});

test('repeated-text needs two text nodes in a row, not the same word across a page', () => {
  const cwd = repo();
  write(cwd, {
    'src/a.html': '<h2>Commands</h2><p>One</p><h2>Commands</h2><ul><li>Install the package</li><li>Install the package</li></ul><table><tr><td>Status ok</td><td>Status ok</td></tr></table>\n',
  });
  assert.equal(idsOf(audit(cwd)).includes('copy/repeated-text'), false);
});
