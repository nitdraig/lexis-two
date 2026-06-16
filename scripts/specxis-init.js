// scripts/specxis-init.js
// Initializes .specxis/ folder structure in the current project.
// Run with: node scripts/specxis-init.js

const fs = require('fs');
const path = require('path');

const dirs = [
  '.specxis/active',
  '.specxis/archive',
];

const debtTemplate = `# Specxis Debt Ledger

Consolidated // lexis: comments across all features.
Updated automatically by /specxis-debt and /specxis-close.

---

<!-- Entries added by specxis-close and specxis-debt commands -->
`;

for (const dir of dirs) {
  fs.mkdirSync(dir, { recursive: true });
  console.log(`created ${dir}/`);
}

const debtPath = '.specxis/debt.md';
if (!fs.existsSync(debtPath)) {
  fs.writeFileSync(debtPath, debtTemplate);
  console.log(`created ${debtPath}`);
}

// Add .specxis/archive to .gitignore if not already there
// (active specs stay in git; archive is optional)
const gitignorePath = '.gitignore';
if (fs.existsSync(gitignorePath)) {
  const content = fs.readFileSync(gitignorePath, 'utf8');
  if (!content.includes('.specxis/archive')) {
    fs.appendFileSync(gitignorePath, '\n# Specxis archived specs (optional)\n# .specxis/archive\n');
    console.log('added .specxis/archive comment to .gitignore');
  }
}

console.log('\nSpecxis initialized. Run /specxis-new to create your first spec.');
