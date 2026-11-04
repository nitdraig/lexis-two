#!/usr/bin/env node

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const { init } = require('../scripts/specxis-init');
const { syncDebt } = require('../scripts/specxis-debt');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-init-'));

test('init creates the folders and a debt file with a managed block', () => {
  const root = tmp();
  const created = init(root);
  assert.deepEqual(created, ['.specxis/active/', '.specxis/archive/', '.specxis/debt.md']);
  assert.match(fs.readFileSync(path.join(root, '.specxis', 'debt.md'), 'utf8'), /lexis-debt:start/);
});

test('a second run changes nothing', () => {
  const root = tmp();
  init(root);
  const debtPath = path.join(root, '.specxis', 'debt.md');
  fs.appendFileSync(debtPath, '\nmy note\n');
  const before = fs.readFileSync(debtPath, 'utf8');
  assert.deepEqual(init(root), []);
  assert.equal(fs.readFileSync(debtPath, 'utf8'), before);
});

test('init never touches .gitignore', () => {
  const root = tmp();
  fs.writeFileSync(path.join(root, '.gitignore'), 'node_modules\n');
  init(root);
  assert.equal(fs.readFileSync(path.join(root, '.gitignore'), 'utf8'), 'node_modules\n');
});

test('the generated debt file works with the debt sync', () => {
  const root = tmp();
  init(root);
  fs.writeFileSync(path.join(root, 'a.js'), '// lexis: simplified\n');
  assert.equal(syncDebt(root).count, 1);
});

test('the CLI names current commands', () => {
  const root = tmp();
  const result = spawnSync(process.execPath, [path.join(__dirname, '..', 'scripts', 'specxis-init.js')], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /\/specx new <slug>/);
  assert.doesNotMatch(result.stdout, /specxis-new/);
});
