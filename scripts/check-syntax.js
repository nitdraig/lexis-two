#!/usr/bin/env node
// Syntax check for every JS source file (`node --check` per file).
// `node --check a.js b.js` only checks the first file, so each file gets its own run.
// Usage: node scripts/check-syntax.js [root]

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.astro', 'fixtures', 'coverage']);
const EXTENSIONS = new Set(['.js', '.mjs', '.cjs']);
// Folders with JS sources. `site/` has its own toolchain (its build covers it); `examples/` holds TypeScript samples with a .js name.
const SOURCE_DIRS = ['scripts', 'hooks', 'bin', 'tests', 'pi-extension', '.opencode/plugins', 'benchmarks'];

function collect(dir, acc = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) collect(abs, acc);
    } else if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name))) {
      acc.push(abs);
    }
  }
  return acc;
}

// Returns the files that fail to parse, with node's message.
function checkSyntax(root) {
  const files = SOURCE_DIRS.flatMap((dir) => collect(path.join(root, dir)));
  const failures = [];
  for (const file of files) {
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (result.status !== 0) {
      failures.push({ file: path.relative(root, file).split(path.sep).join('/'), message: result.stderr.trim() });
    }
  }
  return { checked: files.length, failures };
}

function main() {
  const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
  const { checked, failures } = checkSyntax(root);
  if (failures.length > 0) {
    for (const { file, message } of failures) console.error(`Syntax error in ${file}\n${message}\n`);
    console.error(`${failures.length} of ${checked} files failed.`);
    process.exit(1);
  }
  console.log(`Syntax OK: ${checked} files.`);
}

module.exports = { checkSyntax };

if (require.main === module) {
  main();
}
