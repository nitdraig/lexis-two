#!/usr/bin/env node

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const { checkSyntax } = require('../scripts/check-syntax');

function project(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-syntax-'));
  for (const [name, content] of Object.entries(files)) {
    const abs = path.join(root, name);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
  }
  return root;
}

test('a broken file that is not the first one makes the check fail', () => {
  const root = project({
    'scripts/a.js': 'const a = 1;\n',
    'scripts/b.js': 'const b = ;\n',
    'hooks/c.js': 'const c = 3;\n',
  });
  const { checked, failures } = checkSyntax(root);
  assert.equal(checked, 3);
  assert.deepEqual(failures.map((f) => f.file), ['scripts/b.js']);
});

test('valid .js, .mjs and .cjs files pass; node_modules and fixtures are skipped', () => {
  const root = project({
    'scripts/a.js': 'module.exports = 1;\n',
    'scripts/b.mjs': 'export default 1;\n',
    'hooks/c.cjs': 'module.exports = 2;\n',
    'tests/fixtures/broken.js': 'const x = ;\n',
    'scripts/node_modules/dep/index.js': 'const y = ;\n',
  });
  assert.deepEqual(checkSyntax(root), { checked: 3, failures: [] });
});

test('the CLI exits 1 on a broken file and 0 otherwise', () => {
  const script = path.join(__dirname, '..', 'scripts', 'check-syntax.js');
  const bad = project({ 'scripts/a.js': 'ok = 1;\n', 'scripts/z.js': 'if (\n' });
  const good = project({ 'scripts/a.js': 'ok = 1;\n' });
  assert.equal(spawnSync(process.execPath, [script, bad], { encoding: 'utf8' }).status, 1);
  assert.equal(spawnSync(process.execPath, [script, good], { encoding: 'utf8' }).status, 0);
});

test('this repository passes its own syntax check', () => {
  const { failures } = checkSyntax(path.join(__dirname, '..'));
  assert.deepEqual(failures, []);
});
