#!/usr/bin/env node

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const hook = path.join(__dirname, '..', 'scripts', 'slopx-hook.js');
let counter = 0;

function project(files = {}) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-slopx-hook-'));
  for (const [name, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(cwd, name)), { recursive: true });
    fs.writeFileSync(path.join(cwd, name), content);
  }
  return cwd;
}

function callHook(cwd, file, { env = {}, session = `s-${process.pid}-${(counter += 1)}`, raw } = {}) {
  const input = raw !== undefined ? raw : JSON.stringify({ session_id: session, cwd, tool_name: 'Edit', tool_input: { file_path: path.join(cwd, file) } });
  const started = Date.now();
  const result = spawnSync(process.execPath, [hook], {
    cwd,
    input,
    encoding: 'utf8',
    env: { ...process.env, SLOPX_HOOK: '', SLOPX_HOOK_DISABLED: '', ...env },
  });
  return { ...result, ms: Date.now() - started, session };
}

const ON = { SLOPX_HOOK: '1' };

test('disabled by default: no output, exit 0', () => {
  const cwd = project({ 'a.js': 'debugger;\n' });
  const r = callHook(cwd, 'a.js');
  assert.equal(r.status, 0);
  assert.equal(r.stdout, '');
});

test('enabled by SLOPX_HOOK=1: returns additionalContext for an immediate-tier finding', () => {
  const cwd = project({ 'a.js': 'debugger;\n' });
  const r = callHook(cwd, 'a.js', { env: ON });
  assert.equal(r.status, 0, r.stderr);
  const out = JSON.parse(r.stdout);
  assert.equal(out.hookSpecificOutput.hookEventName, 'PostToolUse');
  assert.match(out.hookSpecificOutput.additionalContext, /a\.js:1 code\/debug-leftover \(warning\)/);
  assert.match(out.hookSpecificOutput.additionalContext, /Suggestion on record/);
  assert.doesNotMatch(out.hookSpecificOutput.additionalContext, /\b(you must|always|never)\b/i, 'factual wording, not commands');
});

test('enabled by .slopx.json, and SLOPX_HOOK_DISABLED=1 wins over both', () => {
  const cwd = project({ 'a.js': 'debugger;\n', '.slopx.json': JSON.stringify({ hook: { enabled: true } }) });
  assert.match(callHook(cwd, 'a.js').stdout, /code\/debug-leftover/);
  assert.equal(callHook(cwd, 'a.js', { env: { SLOPX_HOOK_DISABLED: '1' } }).stdout, '');
  assert.equal(callHook(cwd, 'a.js', { env: { ...ON, SLOPX_HOOK_DISABLED: '1' } }).stdout, '');
});

test('the same session does not hear the same finding twice; a new session does', () => {
  // Session ids are unique per run: the hook keeps its dedupe state in the temp directory.
  const ONE = `dedupe-${process.pid}-${Date.now()}-one`;
  const TWO = `dedupe-${process.pid}-${Date.now()}-two`;
  const cwd = project({ 'a.js': 'debugger;\n' });
  const first = callHook(cwd, 'a.js', { env: ON, session: ONE });
  assert.ok(first.stdout);
  assert.equal(callHook(cwd, 'a.js', { env: ON, session: ONE }).stdout, '');

  fs.writeFileSync(path.join(cwd, 'a.js'), '\n\ndebugger;\n'); // the line moved, same finding
  assert.equal(callHook(cwd, 'a.js', { env: ON, session: ONE }).stdout, '');

  fs.writeFileSync(path.join(cwd, 'a.js'), 'debugger;\ndebugger;\n'); // a second one is new
  assert.match(callHook(cwd, 'a.js', { env: ON, session: ONE }).stdout, /a\.js:2/);

  assert.ok(callHook(cwd, 'a.js', { env: ON, session: TWO }).stdout);
});

test('only the immediate tier runs, with any severity', () => {
  const deferred = project({ 'a.tsx': 'export const A = () => <p>A seamless experience</p>;\n' });
  assert.equal(callHook(deferred, 'a.tsx', { env: ON }).stdout, '');

  const advisoryImmediate = project({ 'a.css': '.card { border-left: 4px solid #3b82f6; }\n' });
  const out = JSON.parse(callHook(advisoryImmediate, 'a.css', { env: ON }).stdout);
  assert.match(out.hookSpecificOutput.additionalContext, /look\/side-tab \(advisory\)/);
});

test('files with nothing to say, outside the project, or missing produce no output and exit 0', () => {
  const cwd = project({ 'a.js': 'const a = 1;\n', 'notes.txt': 'debugger;\n' });
  for (const file of ['a.js', 'notes.txt', 'missing.js', '../outside.js']) {
    const r = callHook(cwd, file, { env: ON });
    assert.equal(r.status, 0, file);
    assert.equal(r.stdout, '', file);
  }
});

test('bad input never breaks the session', () => {
  const cwd = project({ 'a.js': 'debugger;\n' });
  for (const raw of ['', 'not json', '{}', JSON.stringify({ tool_input: {} }), JSON.stringify({ cwd, tool_input: { file_path: 42 } })]) {
    const r = callHook(cwd, 'a.js', { env: ON, raw });
    assert.equal(r.status, 0, raw);
    assert.equal(r.stdout, '', raw);
  }
  const broken = project({ 'a.js': 'debugger;\n', '.slopx.json': '{ nope' });
  const r = callHook(broken, 'a.js', { env: ON });
  assert.equal(r.status, 0);
  assert.equal(r.stdout, '');
});

test('it works in a git repository, using the lines added by the edit', () => {
  const cwd = project({ 'a.js': '// TODO: old\nconst a = 1;\n' });
  const git = (...args) => spawnSync('git', ['-c', 'user.email=t@t.t', '-c', 'user.name=t', ...args], { cwd, encoding: 'utf8' });
  git('init', '-q');
  git('add', '-A');
  git('commit', '-q', '-m', 'base');
  fs.appendFileSync(path.join(cwd, 'a.js'), 'debugger;\n');
  const out = JSON.parse(callHook(cwd, 'a.js', { env: ON }).stdout);
  assert.match(out.hookSpecificOutput.additionalContext, /a\.js:3 code\/debug-leftover/);
  assert.doesNotMatch(out.hookSpecificOutput.additionalContext, /code\/marker/, 'legacy marker is not the edit');
});

test('cold start is recorded: idle and active calls', (t) => {
  const cwd = project({ 'a.js': 'debugger;\n' });
  const idle = Math.min(...[1, 2, 3].map(() => callHook(cwd, 'a.js').ms));
  const active = Math.min(...[1, 2, 3].map(() => callHook(cwd, 'a.js', { env: ON }).ms));
  t.diagnostic(`hook cold start, best of 3: idle ${idle} ms, active ${active} ms (includes spawn)`);
  assert.ok(idle < 5000 && active < 5000);
});
