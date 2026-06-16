#!/usr/bin/env node
// lexis-two — rule copy integrity check
//
// To avoid runtime overhead, instruction-tier hosts (Windsurf, Cline, Kiro,
// Cursor) load static copies of the rules. This script acts as a build/CI guard
// to ensure those copies never drift from the canonical source (AGENTS.md).
//
// It asserts that:
//   1. Every rule copy file exists.
//   2. Every copy is completely identical to AGENTS.md (ignoring host-specific frontmatter).
//   3. The canonical AGENTS.md itself contains the load-bearing Lexis-Two rules.

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// Canonical source of truth
const SOURCE_FILE = 'AGENTS.md';

// Static copies to validate
const COPIES = [
  '.windsurf/rules/lexis-two.md',
  '.clinerules/lexis-two.md',
  '.kiro/steering/lexis-two.md',
  '.cursor/rules/lexis-two.mdc',
];

// Load-bearing phrases that MUST exist in the source of truth. If these are
// missing, the source file has been gutted, and the copies are validating
// against an empty shell.
const INVARIANTS = [
  'lazy senior',
  'Input validation at trust boundaries',
  'YAGNI',
];

function read(relPath) {
  try {
    return fs.readFileSync(path.join(root, relPath), 'utf8');
  } catch (e) {
    console.error(`Error: failed to read ${relPath}`);
    process.exit(1);
  }
}

// 1. Validate canonical source
const source = read(SOURCE_FILE);
for (const phrase of INVARIANTS) {
  if (!source.includes(phrase)) {
    console.error(`Error: canonical source (${SOURCE_FILE}) is missing load-bearing rule: "${phrase}"`);
    process.exit(1);
  }
}

// Helper to strip frontmatter (metadata blocks between '---' at start of file)
function stripFrontmatter(content) {
  return content.replace(/^---[\s\S]*?---\s*/, '');
}

// 2. Validate copies
let failed = false;
const canonicalBody = stripFrontmatter(source).trim();

for (const copyPath of COPIES) {
  const copyContent = read(copyPath);
  const copyBody = stripFrontmatter(copyContent).trim();

  if (copyBody !== canonicalBody) {
    console.error(`Drift detected: ${copyPath} does not match ${SOURCE_FILE}`);
    failed = true;
  }
}

if (failed) {
  console.error('\nIntegrity check FAILED. Rule copies have drifted from AGENTS.md.');
  console.error('To fix, copy AGENTS.md content into the drifted files, preserving their frontmatter if any.');
  process.exit(1);
}

console.log('Rule copy integrity check PASSED.');
process.exit(0);
