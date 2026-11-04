// scripts/specxis-init.js
// Initializes the .specxis/ folder structure in the current project.
// Run with: node scripts/specxis-init.js
// Safe to run twice: it only creates what is missing and edits no other file.

const fs = require('fs');
const path = require('path');

const DIRS = ['.specxis/active', '.specxis/archive'];

const DEBT_TEMPLATE = `# Specxis Debt Ledger

Consolidated // lexis: comments across all features.
Updated by /specx debt and /specx close. Notes outside the block below are never touched.

---

<!-- lexis-debt:start -->
<!-- lexis-debt:end -->
`;

function init(root = '.') {
  const created = [];
  for (const dir of DIRS) {
    const abs = path.join(root, dir);
    if (!fs.existsSync(abs)) {
      fs.mkdirSync(abs, { recursive: true });
      created.push(`${dir}/`);
    }
  }
  const debtPath = path.join(root, '.specxis', 'debt.md');
  if (!fs.existsSync(debtPath)) {
    fs.writeFileSync(debtPath, DEBT_TEMPLATE);
    created.push('.specxis/debt.md');
  }
  return created;
}

function main() {
  const created = init(process.cwd());
  for (const item of created) console.log(`created ${item}`);
  if (created.length === 0) console.log('.specxis/ already initialized; nothing to do.');
  console.log('\nSpecxis ready. Run /specx new <slug> to create your first spec.');
}

module.exports = { init, DIRS, DEBT_TEMPLATE };

if (require.main === module) {
  main();
}
