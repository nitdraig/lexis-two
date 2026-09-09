#!/usr/bin/env node
// Scaffold docs/discovery/<slug>/ from templates/discovery/ (no LLM).

const fs = require('fs');
const path = require('path');

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const TEMPLATE_FILES = [
  '00-brief.md',
  '01-mvp.md',
  '02-priorities.md',
  '03-constraints.md',
  '04-open-questions.md',
  '05-map.md',
  '06-post-mvp.md',
];

function isValidSlug(slug) {
  return typeof slug === 'string' && SLUG_RE.test(slug);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const options = { force: false, slug: '', destRoot: 'docs/discovery' };
  for (const arg of args) {
    if (arg === '--force') options.force = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (!arg.startsWith('-') && !options.slug) options.slug = arg;
  }
  return options;
}

/**
 * @param {{ cwd?: string, slug: string, force?: boolean, destRoot?: string, templatesDir?: string }} options
 * @returns {string} destination folder
 */
function runDiscoveryInit(options) {
  const cwd = options.cwd || process.cwd();
  const slug = options.slug;
  if (!isValidSlug(slug)) {
    throw new Error('Invalid slug: use lowercase kebab-case (e.g. family-shared-expenses)');
  }

  const destRoot = path.resolve(cwd, options.destRoot || 'docs/discovery');
  const dest = path.join(destRoot, slug);
  if (fs.existsSync(dest) && !options.force) {
    throw new Error(`Folder exists: ${dest} (pass --force to overwrite)`);
  }

  const templatesDir =
    options.templatesDir || path.join(__dirname, '..', 'templates', 'discovery');

  fs.mkdirSync(dest, { recursive: true });
  for (const file of TEMPLATE_FILES) {
    const src = path.join(templatesDir, file);
    const body = fs.readFileSync(src, 'utf8').split('{{slug}}').join(slug);
    fs.writeFileSync(path.join(dest, file), body);
  }
  return dest;
}

function main() {
  const options = parseArgs(process.argv);
  if (options.help || !options.slug) {
    console.log('Usage: node scripts/discovery-init.js <slug> [--force]');
    console.log('Creates docs/discovery/<slug>/ from templates/discovery/.');
    process.exit(options.help ? 0 : 1);
  }
  try {
    const dest = runDiscoveryInit({ slug: options.slug, force: options.force });
    console.log(`created ${dest.replace(/\\/g, '/')}/`);
    console.log('Next: fill the seven docs, or run /discx <slug>.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  TEMPLATE_FILES,
  isValidSlug,
  parseArgs,
  runDiscoveryInit,
};
