// scripts/specxis-debt.js
// Portable Node.js script to scan the codebase for "// lexis:" comments
// and sync them with .specxis/debt.md.
// Works on Windows, macOS, and Linux.

const fs = require('fs');
const path = require('path');

const DEBT_FILE = '.specxis/debt.md';

// Recursive directory scan
function scanDir(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      // Skip common ignore folders
      if (['node_modules', '.git', '.specxis', '.astro', 'dist', 'build', '.cache'].includes(file)) continue;
      scanDir(filePath, fileList);
    } else {
      // Only scan relevant code files
      if (['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'].includes(path.extname(file))) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

function findLexisComments() {
  const files = scanDir('.');
  const comments = [];
  const regex = /\/\/\s*lexis:\s*(.*)/gi;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      let match;
      // Reset regex lastIndex
      regex.lastIndex = 0;
      while ((match = regex.exec(line)) !== null) {
        comments.push({
          file: file.replace(/\\/g, '/'), // normalize to forward slashes
          line: index + 1,
          comment: match[1].trim()
        });
      }
    });
  }
  return comments;
}

function syncDebt() {
  if (!fs.existsSync(DEBT_FILE)) {
    console.error(`Error: ${DEBT_FILE} does not exist. Run specxis-init first.`);
    process.exit(1);
  }

  const found = findLexisComments();
  console.log(`Found ${found.length} '// lexis:' comments in codebase.`);

  let debtContent = fs.readFileSync(DEBT_FILE, 'utf8');

  // We want to reconstruct or append to .specxis/debt.md.
  // Let's create a prioritized ledger as described in SPECXIS.md.
  // Categories:
  // - Immediate: shortcuts causing pain or blocking features
  // - Next sprint: shortcuts with a known ceiling approaching
  // - Backlog: fine for now, revisit at scale
  // - Permanent: intentional, no action needed
  
  const immediate = [];
  const nextSprint = [];
  const backlog = [];
  const permanent = [];

  found.forEach(item => {
    const text = item.comment.toLowerCase();
    const entry = `- [ ] **${item.file}:${item.line}**: ${item.comment}`;

    if (text.includes('immediate') || text.includes('critical') || text.includes('pain') || text.includes('block')) {
      immediate.push(entry);
    } else if (text.includes('sprint') || text.includes('soon') || text.includes('ceiling')) {
      nextSprint.push(entry);
    } else if (text.includes('permanent') || text.includes('intentional') || text.includes('no action')) {
      permanent.push(`- **${item.file}:${item.line}**: ${item.comment} (Permanent)`);
    } else {
      backlog.push(entry);
    }
  });

  const header = `# Specxis Debt Ledger

Consolidated // lexis: comments across all features.
Updated automatically by /specxis-debt and /specxis-close.

---

## Prioritized Ledger

### Immediate (shortcuts causing pain or blocking features)
${immediate.length > 0 ? immediate.join('\n') : '*No immediate debt found.*'}

### Next Sprint (shortcuts with a known ceiling approaching)
${nextSprint.length > 0 ? nextSprint.join('\n') : '*No next sprint debt found.*'}

### Backlog (fine for now, revisit at scale)
${backlog.length > 0 ? backlog.join('\n') : '*No backlog debt found.*'}

### Permanent (intentional, no action needed)
${permanent.length > 0 ? permanent.join('\n') : '*No permanent debt found.*'}
`;

  fs.writeFileSync(DEBT_FILE, header);
  console.log(`Updated ${DEBT_FILE} with prioritized ledger.`);
}

syncDebt();
