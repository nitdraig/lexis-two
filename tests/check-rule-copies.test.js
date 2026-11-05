#!/usr/bin/env node

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const realScript = path.join(__dirname, '..', 'scripts', 'check-rule-copies.js');

const CANONICAL = '# Lexis\n\nYou are a lazy senior developer. YAGNI. Input validation at trust boundaries. See ./stacks/<id>.md.\n';
const COPIES = {
  '.windsurf/rules/lexis-two.md': '',
  '.clinerules/lexis-two.md': '',
  '.kiro/steering/lexis-two.md': '---\ndescription: Kiro steering\n---\n',
  '.cursor/rules/lexis-two.mdc': '---\ndescription: Cursor rule\nalwaysApply: true\n---\n',
};

// A tiny repo the script can run in: the script resolves its root from its own location.
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-crc-'));
  const write = (rel, content) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), content);
  };
  write('scripts/check-rule-copies.js', fs.readFileSync(realScript, 'utf8'));
  write('AGENTS.md', CANONICAL);
  for (const [rel, frontmatter] of Object.entries(COPIES)) write(rel, frontmatter + CANONICAL);
  write('.github/copilot-instructions.md', 'lazy senior. Input validation at trust boundaries. YAGNI. stacks/\n');
  const run = (...args) =>
    spawnSync(process.execPath, [path.join(root, 'scripts', 'check-rule-copies.js'), ...args], { encoding: 'utf8' });
  return { root, write, run, read: (rel) => fs.readFileSync(path.join(root, rel), 'utf8') };
}

test('a clean tree passes', () => {
  assert.equal(fixture().run().status, 0);
});

test('drift fails without --fix and names the file', () => {
  const t = fixture();
  t.write('.kiro/steering/lexis-two.md', COPIES['.kiro/steering/lexis-two.md'] + 'edited by hand\n');
  const result = t.run();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Drift detected: \.kiro\/steering\/lexis-two\.md/);
  assert.match(result.stderr, /--fix/);
});

test('--fix rewrites drifted copies and keeps each host frontmatter', () => {
  const t = fixture();
  t.write('.cursor/rules/lexis-two.mdc', COPIES['.cursor/rules/lexis-two.mdc'] + 'something else entirely\n');
  t.write('.windsurf/rules/lexis-two.md', 'no frontmatter, drifted\n');
  fs.rmSync(path.join(t.root, '.clinerules', 'lexis-two.md'));
  t.write('.clinerules/lexis-two.md', 'gone wrong\n');

  const fixed = t.run('--fix');
  assert.equal(fixed.status, 0, fixed.stderr);
  assert.match(fixed.stdout, /Fixed \.cursor\/rules\/lexis-two\.mdc/);

  assert.ok(t.read('.cursor/rules/lexis-two.mdc').startsWith('---\ndescription: Cursor rule\nalwaysApply: true\n---\n'));
  assert.equal(t.read('.windsurf/rules/lexis-two.md').trim(), CANONICAL.trim());
  assert.equal(t.run().status, 0, 'a plain run passes after --fix');
});
