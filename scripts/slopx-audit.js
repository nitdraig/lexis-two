#!/usr/bin/env node
// slopx: keeps a change from looking or reading like default AI output.
// Four passes on every run: code, copy, look (slopx rules) and quality (desx rules, through the
// desx detector). Stdout only: it never writes a file. Rules live in scripts/slopx-rules.js.
//
// Usage: node scripts/slopx-audit.js [--json|--quiet|--github|--list-rules] [--all] [--prose]
//        [--base <ref>] [--no-advisory] [--no-config] [--no-inline-ignores] [--cwd dir]
// Exit: 0 no warnings, 1 invalid input or unreadable target, 2 at least one warning.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { RULES, BY_ID, publicRule, classify, makeContext } = require('./slopx-rules');
const { runDesxAudit } = require('./desx-audit');

const EMPTY_TREE = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';
const MAX_BYTES = 1024 * 1024;
const GENERATED = [
  /(^|\/)(node_modules|dist|build|\.next|coverage)\//,
  /\.min\.(?:js|css)$/,
  /\.d\.ts$/,
  /(^|\/)(?:package-lock\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb?|Cargo\.lock)$/,
  /(^|\/)benchmarks\/results\//,
];
const PASSES = [
  { pass: 'code', owner: 'slopx', none: 'no code files in scope' },
  { pass: 'copy', owner: 'slopx', none: 'no text or UI files in scope' },
  { pass: 'look', owner: 'slopx', none: 'no UI files in scope' },
  { pass: 'quality', owner: 'desx', none: 'no UI files in scope' },
];

class UsageError extends Error {}

// ---------------------------------------------------------------------------
// git
// ---------------------------------------------------------------------------

function git(cwd, args) {
  const result = spawnSync('git', ['-C', cwd, '-c', 'core.quotepath=false', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return result.status === 0 ? result.stdout : null;
}

const splitZ = (out) => (out || '').split('\0').filter(Boolean);

// Added line numbers of every changed tracked file against `base`, from a single diff
// (one git call, not one per file: process starts are slow on Windows).
function addedLinesByFile(cwd, base) {
  const out = git(cwd, ['diff', '-U0', '--no-color', '--no-ext-diff', '--no-renames', '--relative', base]);
  const byFile = new Map();
  if (out === null) return byFile;
  let current = null;
  for (const line of out.split('\n')) {
    if (line.startsWith('+++ ')) {
      let name = line.slice(4).replace(/\t.*$/, '');
      if (name.startsWith('"')) name = name.slice(1, -1).replace(/\\(.)/g, '$1');
      current = name === '/dev/null' ? null : name.replace(/^b\//, '');
      if (current !== null) byFile.set(current, new Set());
      continue;
    }
    const hunk = current !== null && line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
    if (!hunk) continue;
    const start = Number(hunk[1]);
    const count = hunk[2] === undefined ? 1 : Number(hunk[2]);
    for (let i = 0; i < count; i += 1) byFile.get(current).add(start + i);
  }
  return byFile;
}

function resolveBase(cwd, ref) {
  const hasHead = git(cwd, ['rev-parse', '--verify', '--quiet', 'HEAD']) !== null;
  if (ref === undefined) return hasHead ? 'HEAD' : EMPTY_TREE;
  if (git(cwd, ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`]) === null) {
    throw new UsageError(`--base: "${ref}" is not a commit in this repository`);
  }
  const mergeBase = hasHead ? git(cwd, ['merge-base', ref, 'HEAD']) : null;
  return mergeBase ? mergeBase.trim() : ref;
}

// ---------------------------------------------------------------------------
// config, globs
// ---------------------------------------------------------------------------

function globToRegExp(glob) {
  const body = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '\u0000')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '[^/]')
    .replace(/\u0000/g, '.*');
  return new RegExp(glob.includes('/') ? `^${body}$` : `(?:^|/)${body}$`);
}

const needsReason = (entry, where) => {
  if (!entry || typeof entry.reason !== 'string' || !entry.reason.trim()) {
    throw new UsageError(`${where} needs a non-empty "reason"`);
  }
};

function loadConfig(cwd, noConfig) {
  const config = { ignoreRules: [], ignoreFiles: [], ignoreValues: [], extensions: [], advisoryRules: 'include', hook: {} };
  if (noConfig) return config;
  for (const name of ['.slopx.json', '.slopx.local.json']) {
    const file = path.join(cwd, name);
    if (!fs.existsSync(file)) continue;
    let data;
    try {
      data = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      throw new UsageError(`${name} is not valid JSON`);
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new UsageError(`${name} must be a JSON object`);

    (data.ignoreRules || []).forEach((entry, i) => {
      needsReason(entry, `${name} ignoreRules[${i}]`);
      if (entry.rule !== '*' && !BY_ID.has(entry.rule)) throw new UsageError(`${name} ignoreRules[${i}]: unknown rule "${entry.rule}"`);
      config.ignoreRules.push(entry.rule);
    });
    (data.ignoreFiles || []).forEach((entry, i) => {
      needsReason(entry, `${name} ignoreFiles[${i}]`);
      if (typeof entry.glob !== 'string' || path.isAbsolute(entry.glob) || entry.glob.split('/').includes('..')) {
        throw new UsageError(`${name} ignoreFiles[${i}]: glob must be relative and stay inside the repository`);
      }
      config.ignoreFiles.push(globToRegExp(entry.glob));
    });
    (data.ignoreValues || []).forEach((entry, i) => {
      needsReason(entry, `${name} ignoreValues[${i}]`);
      if (!BY_ID.has(entry.rule) || typeof entry.value !== 'string') throw new UsageError(`${name} ignoreValues[${i}] needs a known "rule" and a "value"`);
      config.ignoreValues.push({ rule: entry.rule, value: entry.value, files: entry.files ? globToRegExp(entry.files) : null });
    });
    (data.extensions || []).forEach((entry, i) => {
      if (!entry || typeof entry.ext !== 'string' || entry.engine !== 'html') throw new UsageError(`${name} extensions[${i}] needs "ext" and engine "html"`);
      config.extensions.push({ ext: entry.ext, engine: entry.engine });
    });
    if (data.advisoryRules !== undefined) {
      if (!['include', 'exclude'].includes(data.advisoryRules)) throw new UsageError(`${name}: advisoryRules must be "include" or "exclude"`);
      config.advisoryRules = data.advisoryRules;
    }
    if (data.hook && typeof data.hook === 'object') config.hook = { ...config.hook, ...data.hook };
  }
  return config;
}

// ---------------------------------------------------------------------------
// scope
// ---------------------------------------------------------------------------

function walk(dir, root, acc = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build', 'coverage'].includes(entry.name)) walk(abs, root, acc);
    } else {
      acc.push(path.relative(root, abs).split(path.sep).join('/'));
    }
  }
  return acc;
}

// Files to look at: [{ rel, abs, text, added, kinds }]. `added` is null when every line counts.
function collectScope(cwd, options, config) {
  const repo = git(cwd, ['rev-parse', '--is-inside-work-tree']) !== null;
  if (!repo && !options.all) throw new UsageError('not a git repository. Run it inside one, or pass --all to scan this directory anyway');

  /** @type {Map<string, Set<number>|null>} */
  const wanted = new Map();
  if (options.all) {
    const names = repo ? splitZ(git(cwd, ['ls-files', '-z', '--cached', '--others', '--exclude-standard'])) : walk(cwd, cwd);
    names.forEach((rel) => wanted.set(rel, null));
  } else {
    const base = resolveBase(cwd, options.base);
    for (const [rel, added] of addedLinesByFile(cwd, base)) wanted.set(rel, added);
    for (const rel of splitZ(git(cwd, ['ls-files', '-z', '--others', '--exclude-standard']))) wanted.set(rel, null);
  }

  const only = options.only ? new Set(options.only) : null;
  const files = [];
  for (const [rel, added] of [...wanted].sort(([a], [b]) => (a < b ? -1 : 1))) {
    if (only && !only.has(rel)) continue;
    if (GENERATED.some((re) => re.test(rel)) || config.ignoreFiles.some((re) => re.test(rel))) continue;
    const kinds = classify(rel, config.extensions);
    if (!(kinds.code || kinds.ui || kinds.i18n || kinds.md)) continue;
    const abs = path.join(cwd, rel);
    let stat;
    try {
      stat = fs.lstatSync(abs);
    } catch {
      continue; // deleted
    }
    if (!stat.isFile() || stat.size > MAX_BYTES) continue; // symlinks and large files are never read
    let text;
    try {
      text = fs.readFileSync(abs, 'utf8');
    } catch {
      continue;
    }
    if (text.includes('\u0000')) continue;
    files.push({ rel, abs, text, added: added === undefined ? null : added, kinds });
  }
  return files;
}

// ---------------------------------------------------------------------------
// waivers
// ---------------------------------------------------------------------------

function parseWaivers(lines) {
  const wide = new Set();
  const byLine = new Map();
  const withoutReason = [];
  lines.forEach((line, i) => {
    const m = line.match(/(?:\/\/|\/\*|<!--|#)\s*slopx-disable(-line|-next-line)?\b([^\n]*)$/);
    if (!m) return;
    const rest = m[2].replace(/\s*(?:\*\/|-->)\s*$/, '');
    const colon = rest.indexOf(':');
    const ids = (colon === -1 ? rest : rest.slice(0, colon)).split(',').map((s) => s.trim()).filter(Boolean);
    const reason = colon === -1 ? '' : rest.slice(colon + 1).trim();
    if (ids.length === 0 || !reason) {
      withoutReason.push(i + 1);
      return;
    }
    if (!m[1]) {
      ids.forEach((id) => wide.add(id));
      return;
    }
    const target = m[1] === '-line' ? i + 1 : i + 2;
    if (!byLine.has(target)) byLine.set(target, new Set());
    ids.forEach((id) => byLine.get(target).add(id));
  });
  return { wide, byLine, withoutReason };
}

const LEXIS_EXEMPT = /(?:\/\/|\/\*|<!--)\s*lexis:/;

// ---------------------------------------------------------------------------
// audit
// ---------------------------------------------------------------------------

function runSlopxAudit(options = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  if (!fs.existsSync(cwd) || !fs.statSync(cwd).isDirectory()) throw new UsageError(`--cwd does not exist: ${cwd}`);
  const config = loadConfig(cwd, options.noConfig);
  const files = collectScope(cwd, options, config);

  const info = new Map(); // rel -> { added, waivers, exempt }
  const raw = [];

  for (const file of files) {
    const ctx = makeContext(file.rel, file.text, file.added, file.kinds);
    const waivers = parseWaivers(ctx.lines);
    const exempt = new Set();
    ctx.lines.forEach((line, i) => {
      if (LEXIS_EXEMPT.test(line)) exempt.add(i + 1);
    });
    info.set(file.rel, { added: file.added, waivers, exempt });

    for (const rule of RULES) {
      if (!rule.check || !rule.applies(file.kinds, options)) continue;
      for (const hit of rule.check(ctx)) raw.push({ rule, file: file.rel, ...hit });
    }
    for (const line of waivers.withoutReason) {
      if (ctx.isAdded(line)) raw.push({ rule: BY_ID.get('slopx/waiver-without-reason'), file: file.rel, line });
    }
  }

  // Quality pass: the desx detector, on the same files, never writing a report.
  const uiFiles = files.filter((f) => f.kinds.ui && !f.kinds.test);
  if (uiFiles.length > 0) {
    const desx = runDesxAudit({ cwd, files: uiFiles.map((f) => f.abs), dryRun: true });
    for (const item of desx.findings) {
      const rule = BY_ID.get(`desx/${item.rule}`);
      if (rule) raw.push({ rule, file: item.file, line: item.line });
    }
  }

  const seen = new Set();
  const findings = [];
  for (const hit of raw) {
    const meta = info.get(hit.file);
    if (!meta) continue;
    const { rule, file, line } = hit;
    if (config.ignoreRules.includes(rule.id) || config.ignoreRules.includes('*')) continue;
    if (config.ignoreValues.some((v) => v.rule === rule.id && v.value === hit.ignoreValue && (!v.files || v.files.test(file)))) continue;
    if (meta.exempt.has(line)) continue;
    if (!options.noInlineIgnores) {
      const lineIds = meta.waivers.byLine.get(line);
      const waived = (ids) => ids && (ids.has(rule.id) || ids.has('*'));
      if (waived(meta.waivers.wide) || waived(lineIds)) continue;
    }
    const severity = hit.severity || rule.severity;
    if (severity === 'advisory' && (options.noAdvisory || config.advisoryRules === 'exclude')) continue;
    if (options.tier && rule.tier !== options.tier) continue;
    const key = `${rule.id}|${file}|${line}|${hit.ignoreValue || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    findings.push({
      id: rule.id,
      name: rule.name,
      description: rule.description,
      severity,
      pass: rule.pass,
      category: rule.category,
      owner: rule.owner,
      file,
      line,
      fileLevel: meta.added !== null && !meta.added.has(line),
      suggestion: rule.suggestion,
      handoff: rule.handoff,
      ...(hit.ignoreValue ? { ignoreValue: hit.ignoreValue } : {}),
    });
  }
  findings.sort((a, b) => (a.file === b.file ? a.line - b.line : a.file < b.file ? -1 : 1));

  const inScope = {
    code: files.filter((f) => f.kinds.code).length,
    copy: files.filter((f) => f.kinds.uiText || f.kinds.emojiScope).length,
    look: uiFiles.length,
    quality: uiFiles.length,
  };
  const passes = PASSES.map(({ pass, owner, none }) => ({
    pass,
    owner,
    findings: findings.filter((f) => f.pass === pass).length,
    ...(inScope[pass] === 0 ? { note: none } : {}),
  }));

  return { passes, findings, scope: options.all ? 'all files' : 'changes', files: files.length };
}

// ---------------------------------------------------------------------------
// output
// ---------------------------------------------------------------------------

const countBy = (findings, severity) => findings.filter((f) => f.severity === severity).length;

function summary(result) {
  const w = countBy(result.findings, 'warning');
  const a = countBy(result.findings, 'advisory');
  return `slopx: ${result.findings.length} finding${result.findings.length === 1 ? '' : 's'} (${w} warning${w === 1 ? '' : 's'}, ${a} advisory) in ${result.files} file${result.files === 1 ? '' : 's'}, scope: ${result.scope}`;
}

function renderPlain(result) {
  const out = [summary(result)];
  for (const p of result.passes) {
    out.push(`  ${p.pass.padEnd(8)} ${String(p.findings).padStart(3)}${p.note ? `  (${p.note})` : ''}`);
  }
  const group = (title, owner) => {
    const items = result.findings.filter((f) => f.owner === owner);
    if (items.length === 0) return;
    out.push('', title);
    for (const severity of ['warning', 'advisory']) {
      const list = items.filter((f) => f.severity === severity);
      if (list.length === 0) continue;
      out.push(`  ${severity}:`);
      for (const f of list) {
        out.push(`    ${f.file}:${f.line}${f.fileLevel ? ' (file-level)' : ''}  ${f.id}  ${f.description}`);
        out.push(`        suggestion: ${f.suggestion}${f.handoff ? `  [handoff: ${f.handoff}]` : ''}`);
      }
    }
  };
  group('Generic (slopx)', 'slopx');
  group('Design quality (desx)', 'desx');
  return out.join('\n');
}

const escapeAnnotation = (s) => String(s).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');

function renderGithub(result) {
  return result.findings
    .map((f) => {
      const level = f.severity === 'warning' ? 'warning' : 'notice';
      return `::${level} file=${f.file},line=${f.line},title=${escapeAnnotation(f.id)}::${escapeAnnotation(`[${f.id}] ${f.description}`)}`;
    })
    .join('\n');
}

function renderRules(options) {
  const rules = RULES.map(publicRule);
  if (options.json) return JSON.stringify(rules, null, 2);
  if (options.quiet) return rules.map((r) => r.id).join('\n');
  const out = [];
  for (const pass of ['code', 'copy', 'look', 'quality']) {
    out.push(`${pass} (${pass === 'quality' ? 'desx' : 'slopx'})`);
    for (const r of rules.filter((x) => x.pass === pass)) {
      const flags = [r.severity === 'advisory' ? 'advisory' : null, r.tier2 ? 'tier 2' : null, r.optIn || null].filter(Boolean);
      out.push(`  ${r.id}${flags.length ? `  (${flags.join(', ')})` : ''}`, `      ${r.description}`);
    }
  }
  out.push('', `${rules.length} rules.`);
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const USAGE = `Usage: node scripts/slopx-audit.js [options]
  --json  --quiet  --github  --list-rules   output (plain by default; --quiet prints one summary line on stderr)
  --all                scan every eligible file, not only the changes
  --prose              also check Markdown prose
  --base <ref>         compare against merge-base(ref, HEAD)
  --no-advisory        drop advisory findings
  --no-config          ignore .slopx.json and .slopx.local.json
  --no-inline-ignores  ignore slopx-disable comments
  --cwd <dir>          project directory (default: current)
Exit: 0 no warnings, 1 invalid input, 2 at least one warning. Writes nothing.`;

function parseArgs(args) {
  const options = {};
  const flags = {
    '--json': 'json', '--quiet': 'quiet', '--github': 'github', '--list-rules': 'listRules', '--all': 'all', '--prose': 'prose',
    '--no-advisory': 'noAdvisory', '--no-config': 'noConfig', '--no-inline-ignores': 'noInlineIgnores', '--help': 'help', '-h': 'help',
  };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (flags[arg]) options[flags[arg]] = true;
    else if (arg === '--base' || arg === '--cwd') {
      const value = args[i + 1];
      if (value === undefined || value.startsWith('--')) return { error: `${arg} needs a value` };
      i += 1;
      options[arg.slice(2)] = value;
    } else return { error: `Unknown option: ${arg}` };
  }
  if (options.github && (options.json || options.listRules)) return { error: '--github cannot be used with --json or --list-rules' };
  return { options };
}

function main(args = process.argv.slice(2)) {
  const parsed = parseArgs(args);
  if (parsed.error) {
    console.error(`slopx: ${parsed.error}\n${USAGE}`);
    process.exit(1);
  }
  const { options } = parsed;
  if (options.help) {
    console.log(USAGE);
    process.exit(0);
  }
  if (options.listRules) {
    console.log(renderRules(options));
    process.exit(0);
  }
  let result;
  try {
    result = runSlopxAudit(options);
  } catch (e) {
    console.error(`slopx: ${e instanceof UsageError ? e.message : `could not scan: ${e.message}`}`);
    process.exit(1);
  }
  if (options.json) console.log(JSON.stringify({ passes: result.passes, findings: result.findings }, null, 2));
  else if (options.github) {
    const lines = renderGithub(result);
    if (lines) console.log(lines);
  } else if (options.quiet) console.error(summary(result));
  else console.log(renderPlain(result));
  process.exit(countBy(result.findings, 'warning') > 0 ? 2 : 0);
}

module.exports = {
  UsageError,
  runSlopxAudit,
  parseArgs,
  parseWaivers,
  loadConfig,
  globToRegExp,
  renderPlain,
  renderGithub,
  renderRules,
  summary,
};

if (require.main === module) {
  main();
}
