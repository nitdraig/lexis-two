#!/usr/bin/env node

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  BLOCK_START,
  BLOCK_END,
  classify,
  mergeDebt,
  syncDebt,
  findLexisComments,
} = require('../scripts/specxis-debt');

function project(files, debt) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-debt-'));
  fs.mkdirSync(path.join(root, '.specxis'));
  fs.writeFileSync(path.join(root, '.specxis', 'debt.md'), debt);
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(root, name), content);
  }
  return root;
}

const readDebt = (root) => fs.readFileSync(path.join(root, '.specxis', 'debt.md'), 'utf8');

test('requiring the script does not run it', () => {
  assert.equal(typeof syncDebt, 'function');
});

test('classifier uses whole words', () => {
  assert.equal(classify('native <blockquote> styling, not a blocker'), 'backlog');
  assert.equal(classify('painless migration'), 'backlog');
  assert.equal(classify('immediate: breaks on empty input'), 'immediate');
  assert.equal(classify('revisit at ceiling of 1k items'), 'nextSprint');
  assert.equal(classify('intentional, no action'), 'permanent');
});

test('hand-written notes outside the block survive a sync', () => {
  const root = project({ 'a.js': '// lexis: simplified, revisit later\n' }, '# Ledger\n\nMy notes that must survive.\n');
  syncDebt(root);
  const out = readDebt(root);
  assert.match(out, /My notes that must survive\./);
  assert.match(out, /\*\*a\.js:1\*\*: simplified, revisit later/);
  assert.ok(out.includes(BLOCK_START) && out.includes(BLOCK_END));
});

test('a ledger written by the old version loses nothing on first sync', () => {
  const old = '# Specxis Debt Ledger\n\n### Immediate\n- [x] **old.js:9**: hand-ticked\n';
  const root = project({ 'a.js': '// lexis: one\n' }, old);
  syncDebt(root);
  assert.ok(readDebt(root).startsWith(old));
});

test('a ticked entry stays ticked when its line moves', () => {
  const root = project({ 'a.js': '// lexis: keep me\n' }, '# Ledger\n');
  syncDebt(root);
  fs.writeFileSync(path.join(root, '.specxis', 'debt.md'), readDebt(root).replace('- [ ] **a.js:1**', '- [x] **a.js:1**'));
  fs.writeFileSync(path.join(root, 'a.js'), '\n\n// lexis: keep me\n');
  syncDebt(root);
  assert.match(readDebt(root), /- \[x\] \*\*a\.js:3\*\*: keep me/);
});

test('sync is idempotent', () => {
  const root = project({ 'a.js': '// lexis: x\n' }, '# Ledger\n');
  syncDebt(root);
  const once = readDebt(root);
  syncDebt(root);
  assert.equal(readDebt(root), once);
});

test('skips node_modules and survives a broken symlink', (t) => {
  const root = project({ 'a.js': '// lexis: real\n' }, '# Ledger\n');
  fs.mkdirSync(path.join(root, 'node_modules'));
  fs.writeFileSync(path.join(root, 'node_modules', 'x.js'), '// lexis: vendor\n');
  try {
    fs.symlinkSync(path.join(root, 'missing-target.js'), path.join(root, 'broken.js'));
  } catch {
    t.diagnostic('symlink creation not permitted here; broken-link case skipped');
  }
  const found = findLexisComments(root);
  assert.deepEqual(found.map((f) => f.file), ['a.js']);
});

test('a missing debt file fails without writing anything', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-debt-none-'));
  assert.throws(() => syncDebt(root), /does not exist/);
  assert.equal(fs.existsSync(path.join(root, '.specxis')), false);
});

test('mergeDebt on empty content creates a block', () => {
  const out = mergeDebt('', []);
  assert.ok(out.startsWith(BLOCK_START));
});
