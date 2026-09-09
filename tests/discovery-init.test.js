#!/usr/bin/env node

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const {
  TEMPLATE_FILES,
  isValidSlug,
  parseArgs,
  runDiscoveryInit,
} = require('../scripts/discovery-init');

const script = path.join(__dirname, '..', 'scripts', 'discovery-init.js');

test('isValidSlug accepts kebab-case', () => {
  assert.equal(isValidSlug('family-shared-expenses'), true);
  assert.equal(isValidSlug('mvp'), true);
});

test('isValidSlug rejects invalid slugs', () => {
  assert.equal(isValidSlug('Family'), false);
  assert.equal(isValidSlug('foo_bar'), false);
  assert.equal(isValidSlug('-x'), false);
  assert.equal(isValidSlug(''), false);
});

test('parseArgs reads slug and --force', () => {
  const options = parseArgs(['node', 'discovery-init.js', 'my-app', '--force']);
  assert.equal(options.slug, 'my-app');
  assert.equal(options.force, true);
});

test('runDiscoveryInit writes seven files with slug substituted', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-discovery-'));
  const dest = runDiscoveryInit({ cwd, slug: 'family-shared-expenses' });
  assert.equal(TEMPLATE_FILES.length, 7);
  for (const file of TEMPLATE_FILES) {
    const body = fs.readFileSync(path.join(dest, file), 'utf8');
    assert.match(body, /family-shared-expenses/);
    assert.equal(body.includes('{{slug}}'), false);
  }
});

test('runDiscoveryInit fails if folder exists without --force', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-discovery-'));
  runDiscoveryInit({ cwd, slug: 'dup-app' });
  assert.throws(() => runDiscoveryInit({ cwd, slug: 'dup-app' }), /Folder exists/);
});

test('runDiscoveryInit --force overwrites', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-discovery-'));
  runDiscoveryInit({ cwd, slug: 'dup-app' });
  const dest = runDiscoveryInit({ cwd, slug: 'dup-app', force: true });
  assert.ok(fs.existsSync(path.join(dest, '06-post-mvp.md')));
});

test('CLI rejects invalid slug', () => {
  const result = spawnSync(process.execPath, [script, 'Not_Valid'], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Invalid slug/);
});
