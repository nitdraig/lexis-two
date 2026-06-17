#!/usr/bin/env node

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

test('postinstall patches OpenCode @latest wrapper package.json', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-two-wrapper-'));
  const wrapperDir = path.join(tmp, 'packages', '@draig', 'lexis-two@latest');
  const pkgDir = path.join(wrapperDir, 'node_modules', '@draig', 'lexis-two');
  fs.mkdirSync(pkgDir, { recursive: true });

  fs.writeFileSync(
    path.join(wrapperDir, 'package.json'),
    JSON.stringify({ dependencies: { '@draig/lexis-two': '1.0.9' } }, null, 2),
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

  const scriptUrl = pathToFileURL(path.join(pkgDir, 'scripts', 'opencode-wrapper-postinstall.mjs'));
  await import(scriptUrl);

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
