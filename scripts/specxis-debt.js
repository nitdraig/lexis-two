// scripts/specxis-debt.js
// Scans the codebase for "// lexis:" comments and syncs them into the managed
// block of .specxis/debt.md. Everything outside the block is left untouched.
// Works on Windows, macOS, and Linux.

const fs = require('fs');
const path = require('path');

const DEBT_FILE = path.join('.specxis', 'debt.md');
const BLOCK_START = '<!-- lexis-debt:start -->';
const BLOCK_END = '<!-- lexis-debt:end -->';

const SKIP_DIRS = new Set([
  'node_modules', '.git', '.specxis', '.astro', '.next', '.cache', 'dist', 'build', 'coverage', 'out',
]);
const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

// lexis: keyword buckets on whole words only. Ambiguous words ("block", "pain" inside
// "painless") were dropped because they misfiled comments such as "not a blocker".
const IMMEDIATE = /\b(immediate|critical|urgent|pain)\b/i;
const NEXT_SPRINT = /\b(sprint|soon|ceiling)\b/i;
const PERMANENT = /\b(permanent|intentional|no action)\b/i;

function scanDir(dir, fileList = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return fileList;
  }
  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue;
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) scanDir(filePath, fileList);
    } else if (entry.isFile() && CODE_EXT.has(path.extname(entry.name))) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function findLexisComments(root = '.') {
  const comments = [];
  const regex = /\/\/\s*lexis:\s*(.*)/i;
  for (const file of scanDir(root)) {
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue; // unreadable file: skip it, never abort the sync
    }
    content.split(/\r?\n/).forEach((line, index) => {
      const match = regex.exec(line);
      if (match) {
        comments.push({
          file: path.relative(root, file).replace(/\\/g, '/'),
          line: index + 1,
          comment: match[1].trim(),
        });
      }
    });
  }
  return comments;
}

function classify(comment) {
  if (IMMEDIATE.test(comment)) return 'immediate';
  if (NEXT_SPRINT.test(comment)) return 'nextSprint';
  if (PERMANENT.test(comment)) return 'permanent';
  return 'backlog';
}

const entryKey = (file, comment) => `${file}\u0000${comment}`;

// Ticked entries in the existing block, keyed by file + comment text so a moved line keeps its tick.
function readTicked(block) {
  const ticked = new Set();
  const re = /^- \[x\] \*\*(.+?):\d+\*\*: (.*)$/gim;
  let m;
  while ((m = re.exec(block))) ticked.add(entryKey(m[1], m[2].trim()));
  return ticked;
}

function renderBlock(found, ticked) {
  const buckets = { immediate: [], nextSprint: [], backlog: [], permanent: [] };
  for (const item of found) {
    const kind = classify(item.comment);
    const loc = `**${item.file}:${item.line}**: ${item.comment}`;
    if (kind === 'permanent') {
      buckets.permanent.push(`- ${loc} (Permanent)`);
    } else {
      const box = ticked.has(entryKey(item.file, item.comment)) ? 'x' : ' ';
      buckets[kind].push(`- [${box}] ${loc}`);
    }
  }
  const list = (items, empty) => (items.length ? items.join('\n') : empty);
  return `${BLOCK_START}
## Prioritized Ledger

### Immediate (shortcuts causing pain or blocking features)
${list(buckets.immediate, '*No immediate debt found.*')}

### Next Sprint (shortcuts with a known ceiling approaching)
${list(buckets.nextSprint, '*No next sprint debt found.*')}

### Backlog (fine for now, revisit at scale)
${list(buckets.backlog, '*No backlog debt found.*')}

### Permanent (intentional, no action needed)
${list(buckets.permanent, '*No permanent debt found.*')}
${BLOCK_END}`;
}

// Returns the new file content; never touches text outside the managed block.
function mergeDebt(existing, found) {
  const start = existing.indexOf(BLOCK_START);
  const end = existing.indexOf(BLOCK_END);
  if (start !== -1 && end > start) {
    const oldBlock = existing.slice(start, end + BLOCK_END.length);
    const block = renderBlock(found, readTicked(oldBlock));
    return existing.slice(0, start) + block + existing.slice(end + BLOCK_END.length);
  }
  // No managed block yet (new file or a ledger written by an older version): append, lose nothing.
  const separator = existing.length === 0 || existing.endsWith('\n\n') ? '' : existing.endsWith('\n') ? '\n' : '\n\n';
  return existing + separator + renderBlock(found, new Set()) + '\n';
}

function syncDebt(root = '.') {
  const debtPath = path.join(root, DEBT_FILE);
  if (!fs.existsSync(debtPath)) {
    throw new Error(`${DEBT_FILE} does not exist. Run specxis-init first.`);
  }
  const found = findLexisComments(root); // scan completes before anything is written
  const next = mergeDebt(fs.readFileSync(debtPath, 'utf8'), found);
  fs.writeFileSync(debtPath, next);
  return { count: found.length, debtPath };
}

function main() {
  try {
    const { count, debtPath } = syncDebt(process.cwd());
    console.log(`Found ${count} '// lexis:' comments in codebase.`);
    console.log(`Updated ${path.relative(process.cwd(), debtPath).replace(/\\/g, '/')}.`);
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}

module.exports = {
  BLOCK_START,
  BLOCK_END,
  scanDir,
  findLexisComments,
  classify,
  mergeDebt,
  syncDebt,
};

if (require.main === module) {
  main();
}
