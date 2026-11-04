#!/usr/bin/env node

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

test('postinstall patches OpenCode @latest wrapper package.json', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-two-wrapper-'));
  const wrapperDir = path.join(tmp, 'packages', '@draig', 'lexis-two@latest');
  const pkgDir = path.join(wrapperDir, 'node_modules', '@draig', 'lexis-two');
  fs.mkdirSync(pkgDir, { recursive: true });

  fs.writeFileSync(
    path.join(wrapperDir, 'package.json'),
    JSON.stringify({ dependencies: { '@draig/lexis-two': '1.1.1' } }, null, 2),
  );
  fs.copyFileSync(
    path.join(__dirname, '..', 'package.json'),
    path.join(pkgDir, 'package.json'),
  );
  fs.mkdirSync(path.join(pkgDir, 'scripts'), { recursive: true });
  fs.copyFileSync(
    path.join(__dirname, '..', 'scripts', 'opencode-wrapper-postinstall.mjs'),
    path.join(pkgDir, 'scripts', 'opencode-wrapper-postinstall.mjs'),
  );

  // lexis: child process — the script calls process.exit, which would end this runner with success
  const result = spawnSync(
    process.execPath,
    [path.join(pkgDir, 'scripts', 'opencode-wrapper-postinstall.mjs')],
    { encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr);

  const wrapper = JSON.parse(fs.readFileSync(path.join(wrapperDir, 'package.json'), 'utf8'));
  assert.equal(
    wrapper.main,
    './node_modules/@draig/lexis-two/.opencode/plugins/lexis-two.mjs',
  );
  assert.equal(
    wrapper.exports['./server'],
    './node_modules/@draig/lexis-two/.opencode/plugins/lexis-two.mjs',
  );
  assert.deepEqual(wrapper['oc-plugin'], ['server', 'tui']);

  fs.rmSync(tmp, { recursive: true, force: true });
});
