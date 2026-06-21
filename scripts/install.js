#!/usr/bin/env node
// lexis-two — interactive installer (phase A1–A4: rules, OpenCode, uninstall, hints)

const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');
const { spawnSync } = require('child_process');

const PACKAGE_ROOT = path.resolve(__dirname, '..');
const OPENCODE_PLUGIN_ENTRY = '@draig/lexis-two';
const REPO_URL = 'https://github.com/nitdraig/lexis-two';

/** @type {Record<string, RuleHost>} */
const RULE_HOSTS = {
  cursor: {
    id: 'cursor',
    label: 'Cursor',
    src: '.cursor/rules/lexis-two.mdc',
    projectDest: '.cursor/rules/lexis-two.mdc',
    globalDest: (home) => path.join(home, '.cursor', 'rules', 'lexis-two.mdc'),
    supportsGlobal: true,
    detect(ctx) {
      return (
        dirExists(path.join(ctx.projectDir, '.cursor')) ||
        dirExists(path.join(ctx.home, '.cursor')) ||
        commandExists('cursor')
      );
    },
  },
  windsurf: {
    id: 'windsurf',
    label: 'Windsurf',
    src: '.windsurf/rules/lexis-two.md',
    projectDest: '.windsurf/rules/lexis-two.md',
    supportsGlobal: false,
    detect(ctx) {
      return dirExists(path.join(ctx.projectDir, '.windsurf'));
    },
  },
  cline: {
    id: 'cline',
    label: 'Cline',
    src: '.clinerules/lexis-two.md',
    projectDest: '.clinerules/lexis-two.md',
    supportsGlobal: false,
    detect(ctx) {
      return dirExists(path.join(ctx.projectDir, '.clinerules'));
    },
  },
  kiro: {
    id: 'kiro',
    label: 'Kiro',
    src: '.kiro/steering/lexis-two.md',
    projectDest: '.kiro/steering/lexis-two.md',
    supportsGlobal: false,
    detect(ctx) {
      return dirExists(path.join(ctx.projectDir, '.kiro'));
    },
  },
  agents: {
    id: 'agents',
    label: 'AGENTS.md (generic agents)',
    src: 'AGENTS.md',
    projectDest: 'AGENTS.md',
    supportsGlobal: false,
    neverOverwriteWithoutForce: true,
    detect() {
      return true;
    },
  },
  'copilot-repo': {
    id: 'copilot-repo',
    label: 'GitHub Copilot (repo instructions)',
    src: '.github/copilot-instructions.md',
    projectDest: '.github/copilot-instructions.md',
    supportsGlobal: false,
    neverOverwriteWithoutForce: true,
    detect(ctx) {
      return dirExists(path.join(ctx.projectDir, '.github'));
    },
  },
};

/** @type {Record<string, PluginHost>} */
const PLUGIN_HOSTS = {
  opencode: {
    id: 'opencode',
    label: 'OpenCode',
    supportsGlobal: true,
    detect(ctx) {
      return (
        fileExists(path.join(ctx.projectDir, 'opencode.json')) ||
        dirExists(getOpencodeConfigDir(ctx.home)) ||
        commandExists('opencode')
      );
    },
  },
};

/** @type {Record<string, HintHost>} */
const HINT_HOSTS = {
  claude: {
    id: 'claude',
    label: 'Claude Code (plugin)',
    detect(ctx) {
      return (
        dirExists(path.join(ctx.home, '.claude')) ||
        typeof process.env.CLAUDE_CONFIG_DIR === 'string' ||
        commandExists('claude')
      );
    },
    getHints() {
      return [
        'Claude Code installs via marketplace or a local plugin folder.',
        `Package path: ${displayPath(PACKAGE_ROOT)}`,
        `Clone: git clone ${REPO_URL}.git ~/lexis-two`,
        'Point Claude at .claude-plugin/plugin.json (hooks, commands, skills).',
        'After install: restart Claude Code and run /lexis status.',
        `Docs: ${REPO_URL}/blob/main/docs/setup.md#claude-code`,
      ];
    },
  },
  copilot: {
    id: 'copilot',
    label: 'GitHub Copilot (IDE extension)',
    detect(ctx) {
      return (
        dirExists(path.join(ctx.projectDir, '.github')) ||
        commandExists('code')
      );
    },
    getHints() {
      return [
        'Copilot IDE extensions publish through the GitHub Copilot Extension program.',
        `Manifest: ${displayPath(path.join(PACKAGE_ROOT, '.github/plugin/plugin.json'))}`,
        'Repo-level instructions (automated): --host copilot-repo',
        `Docs: ${REPO_URL}/blob/main/docs/setup.md#github-copilot`,
      ];
    },
  },
  gemini: {
    id: 'gemini',
    label: 'Gemini CLI (extension)',
    detect(ctx) {
      return (
        fileExists(path.join(ctx.projectDir, 'gemini-extension.json')) ||
        commandExists('gemini')
      );
    },
    getHints() {
      return [
        'Gemini CLI extensions install from a directory with gemini-extension.json.',
        `Run: cd "${PACKAGE_ROOT}" && gemini extensions install .`,
        `Clone: git clone ${REPO_URL}.git ~/lexis-two && cd ~/lexis-two`,
        'Loads AGENTS.md, commands/, and skills/ from the extension manifest.',
        `Docs: ${REPO_URL}/blob/main/docs/setup.md#gemini-cli`,
      ];
    },
  },
  pi: {
    id: 'pi',
    label: 'pi (extension)',
    detect() {
      return commandExists('pi');
    },
    getHints() {
      return [
        'pi reads extensions from package.json "pi" field.',
        'Install: npm install -g @draig/lexis-two',
        'Or from clone: npm install -g . at the repo root',
        'After install: run /lexis status and /specxis status in pi.',
        `Docs: ${REPO_URL}/blob/main/docs/setup.md#pi`,
      ];
    },
  },
};

const ALL_HOST_IDS = [
  ...Object.keys(RULE_HOSTS),
  ...Object.keys(PLUGIN_HOSTS),
  ...Object.keys(HINT_HOSTS),
];

/**
 * @typedef {object} RuleHost
 * @property {string} id
 * @property {string} label
 * @property {string} src
 * @property {string} projectDest
 * @property {(home: string) => string} [globalDest]
 * @property {boolean} supportsGlobal
 * @property {boolean} [neverOverwriteWithoutForce]
 * @property {(ctx: InstallContext) => boolean} detect
 */

/**
 * @typedef {object} InstallContext
 * @property {string} projectDir
 * @property {string} home
 * @property {string} packageRoot
 */

/**
 * @typedef {object} InstallOptions
 * @property {string[]} hosts
 * @property {'project' | 'global' | 'both'} scope
 * @property {boolean} yes
 * @property {boolean} dryRun
 * @property {boolean} force
 * @property {boolean} uninstall
 * @property {boolean} help
 * @property {boolean} interactive
 * @property {string} projectDir
 */

/**
 * @typedef {object} PluginHost
 * @property {string} id
 * @property {string} label
 * @property {boolean} supportsGlobal
 * @property {(ctx: InstallContext) => boolean} detect
 */

/**
 * @typedef {object} InstallAction
 * @property {'copy' | 'merge' | 'remove' | 'hint' | 'skip'} type
 * @property {string} host
 * @property {'project' | 'global'} scope
 * @property {string} to
 * @property {string} [from]
 * @property {string} [content]
 * @property {string[]} [lines]
 * @property {string} [reason]
 * @property {string} [backup]
 */

/**
 * @typedef {object} HintHost
 * @property {string} id
 * @property {string} label
 * @property {(ctx: InstallContext) => boolean} detect
 * @property {(ctx: InstallContext) => string[]} getHints
 */

function fileExists(target) {
  try {
    return fs.statSync(target).isFile();
  } catch {
    return false;
  }
}

function getOpencodeConfigDir(home) {
  // lexis: match `opencode debug paths` — on Windows OpenCode uses ~/.config/opencode, not %APPDATA%/opencode
  if (process.env.OPENCODE_CONFIG_DIR) {
    return process.env.OPENCODE_CONFIG_DIR;
  }
  const xdg = process.env.XDG_CONFIG_HOME;
  if (xdg) {
    return path.join(xdg, 'opencode');
  }
  return path.join(home, '.config', 'opencode');
}

function isLexisPluginEntry(entry) {
  if (typeof entry !== 'string') {
    return false;
  }
  return (
    entry === OPENCODE_PLUGIN_ENTRY ||
    entry.includes('lexis-two') && entry.includes('plugin')
  );
}

function listOpencodeCommandFiles() {
  const dir = path.join(PACKAGE_ROOT, '.opencode', 'commands');
  return fs
    .readdirSync(dir)
    .filter(
      (name) =>
        name.endsWith('.md') &&
        (name.startsWith('lexis') || name.startsWith('specxis')),
    )
    .map((name) => ({
      name,
      src: path.join(dir, name),
    }));
}

function listPortableSkillDirs() {
  const dir = path.join(PACKAGE_ROOT, 'skills');
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(dir, name, 'SKILL.md')))
    .map((name) => ({
      name,
      src: path.join(dir, name, 'SKILL.md'),
    }));
}

function cursorSkillDest(ctx, installScope, skillName) {
  const base = installScope === 'project' ? ctx.projectDir : ctx.home;
  return path.join(base, '.cursor', 'skills', skillName, 'SKILL.md');
}

function planCursorSkillCopies(options, ctx) {
  const host = RULE_HOSTS.cursor;
  const scopes = resolveScopes(options.scope, host);
  /** @type {InstallAction[]} */
  const actions = [];

  for (const installScope of scopes) {
    for (const skill of listPortableSkillDirs()) {
      actions.push(
        planFileCopy(
          'cursor',
          installScope,
          skill.src,
          cursorSkillDest(ctx, installScope, skill.name),
          options,
          false,
        ),
      );
    }
  }

  return actions;
}

function planCursorSkillRemoves(ctx, options) {
  const host = RULE_HOSTS.cursor;
  const scopes = resolveScopes(options.scope, host);
  /** @type {InstallAction[]} */
  const actions = [];

  for (const installScope of scopes) {
    for (const skill of listPortableSkillDirs()) {
      actions.push(
        planFileRemove(
          'cursor',
          installScope,
          cursorSkillDest(ctx, installScope, skill.name),
          skill.src,
        ),
      );
    }
  }

  return actions;
}

function readJsonConfig(configPath) {
  if (!fs.existsSync(configPath)) {
    return {};
  }
  const raw = fs.readFileSync(configPath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(
      `Invalid JSON in ${configPath}. Fix it manually before running the installer.`,
    );
  }
}

function dirExists(target) {
  try {
    return fs.statSync(target).isDirectory();
  } catch {
    return false;
  }
}

function commandExists(cmd) {
  try {
    const checker = process.platform === 'win32' ? 'where' : 'which';
    const result = spawnSync(checker, [cmd], { stdio: 'ignore' });
    return result.status === 0;
  } catch {
    return false;
  }
}

function backupPath(targetPath) {
  return `${targetPath}.bak`;
}

function displayPath(absPath) {
  const home = os.homedir();
  if (absPath.startsWith(home)) {
    return `~${absPath.slice(home.length).replace(/\\/g, '/')}`;
  }
  return absPath.replace(/\\/g, '/');
}

function isHintHost(hostId) {
  return Object.prototype.hasOwnProperty.call(HINT_HOSTS, hostId);
}

function readPackageFile(relPath) {
  const abs = path.join(PACKAGE_ROOT, relPath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Missing package file: ${relPath}`);
  }
  return fs.readFileSync(abs, 'utf8');
}

function parseArgs(argv) {
  /** @type {InstallOptions} */
  const options = {
    hosts: [],
    scope: 'project',
    yes: false,
    dryRun: false,
    force: false,
    uninstall: false,
    help: false,
    interactive: process.stdin.isTTY === true,
    projectDir: process.cwd(),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === 'install') {
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }
    if (arg === '--yes' || arg === '-y') {
      options.yes = true;
      continue;
    }
    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }
    if (arg === '--force') {
      options.force = true;
      continue;
    }
    if (arg === '--uninstall') {
      options.uninstall = true;
      continue;
    }
    if (arg === '--non-interactive') {
      options.interactive = false;
      continue;
    }
    if (arg.startsWith('--host=')) {
      options.hosts.push(...splitList(arg.slice('--host='.length)));
      continue;
    }
    if (arg === '--host') {
      const next = argv[i + 1];
      if (!next) throw new Error('Missing value for --host');
      options.hosts.push(...splitList(next));
      i += 1;
      continue;
    }
    if (arg.startsWith('--scope=')) {
      options.scope = parseScope(arg.slice('--scope='.length));
      continue;
    }
    if (arg === '--scope') {
      const next = argv[i + 1];
      if (!next) throw new Error('Missing value for --scope');
      options.scope = parseScope(next);
      i += 1;
      continue;
    }
    if (arg.startsWith('--project-dir=')) {
      options.projectDir = path.resolve(arg.slice('--project-dir='.length));
      continue;
    }
    if (arg === '--project-dir') {
      const next = argv[i + 1];
      if (!next) throw new Error('Missing value for --project-dir');
      options.projectDir = path.resolve(next);
      i += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  options.hosts = [...new Set(options.hosts.map((host) => host.trim()).filter(Boolean))];
  return options;
}

function splitList(value) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function parseScope(value) {
  if (value === 'project' || value === 'global' || value === 'both') {
    return value;
  }
  throw new Error(`Invalid scope: ${value}. Use project, global, or both.`);
}

function createContext(projectDir) {
  return {
    projectDir: path.resolve(projectDir),
    home: os.homedir(),
    packageRoot: PACKAGE_ROOT,
  };
}

function detectHosts(ctx) {
  const copyHosts = Object.values(RULE_HOSTS)
    .filter((host) => host.detect(ctx))
    .map((host) => host.id);
  const pluginHosts = Object.values(PLUGIN_HOSTS)
    .filter((host) => host.detect(ctx))
    .map((host) => host.id);
  const hintHosts = Object.values(HINT_HOSTS)
    .filter((host) => host.detect(ctx))
    .map((host) => host.id);
  return [...new Set([...copyHosts, ...pluginHosts, ...hintHosts])];
}

function validateHostIds(hostIds) {
  for (const hostId of hostIds) {
    if (!ALL_HOST_IDS.includes(hostId)) {
      throw new Error(`Unknown host: ${hostId}. Valid: ${ALL_HOST_IDS.join(', ')}`);
    }
  }
}

function resolveScopes(scope, host) {
  if (scope === 'both') {
    return host.supportsGlobal ? ['project', 'global'] : ['project'];
  }
  if (scope === 'global' && !host.supportsGlobal) {
    return [];
  }
  return [scope];
}

function planFileCopy(hostId, installScope, from, to, options, neverOverwriteWithoutForce) {
  const incoming = fs.readFileSync(from, 'utf8');

  /** @type {InstallAction} */
  const action = {
    type: 'copy',
    host: hostId,
    scope: installScope,
    from,
    to,
  };

  if (!fs.existsSync(to)) {
    return action;
  }

  const existing = fs.readFileSync(to, 'utf8');
  if (existing === incoming) {
    action.type = 'skip';
    action.reason = 'identical';
    return action;
  }

  if (neverOverwriteWithoutForce && !options.force) {
    action.type = 'skip';
    action.reason = 'exists';
    return action;
  }

  if (!options.force) {
    action.type = 'skip';
    action.reason = 'exists';
    return action;
  }

  action.backup = backupPath(to);
  return action;
}

function planFileRemove(hostId, installScope, targetPath, packageSrcAbs) {
  /** @type {InstallAction} */
  const action = {
    type: 'remove',
    host: hostId,
    scope: installScope,
    to: targetPath,
  };

  if (!fs.existsSync(targetPath)) {
    action.type = 'skip';
    action.reason = 'missing';
    return action;
  }

  const installed = fs.readFileSync(targetPath, 'utf8');
  const expected = fs.readFileSync(packageSrcAbs, 'utf8');
  if (installed !== expected) {
    action.type = 'skip';
    action.reason = 'modified';
    return action;
  }

  action.backup = backupPath(targetPath);
  return action;
}

function planCopyAction(host, installScope, destPath, options) {
  const from = path.join(PACKAGE_ROOT, host.src);
  return planFileCopy(
    host.id,
    installScope,
    from,
    destPath,
    options,
    host.neverOverwriteWithoutForce === true,
  );
}

function planOpencodeConfigMerge(configPath, installScope, options) {
  const config = readJsonConfig(configPath);
  const plugins = Array.isArray(config.plugin) ? [...config.plugin] : [];

  /** @type {InstallAction} */
  const action = {
    type: 'merge',
    host: 'opencode',
    scope: installScope,
    to: configPath,
    content: '',
  };

  if (plugins.some(isLexisPluginEntry)) {
    action.type = 'skip';
    action.reason = 'already-configured';
    return action;
  }

  plugins.push(OPENCODE_PLUGIN_ENTRY);
  const nextConfig = { ...config, plugin: plugins };
  action.content = `${JSON.stringify(nextConfig, null, 2)}\n`;

  if (fs.existsSync(configPath) && fs.readFileSync(configPath, 'utf8') === action.content) {
    action.type = 'skip';
    action.reason = 'identical';
    return action;
  }

  if (fs.existsSync(configPath)) {
    action.backup = backupPath(configPath);
  }

  return action;
}

function planOpencodeConfigUninstall(configPath, installScope) {
  if (!fs.existsSync(configPath)) {
    return {
      type: 'skip',
      host: 'opencode',
      scope: installScope,
      to: configPath,
      reason: 'missing',
    };
  }

  const config = readJsonConfig(configPath);
  const plugins = Array.isArray(config.plugin) ? [...config.plugin] : [];
  const filtered = plugins.filter((entry) => !isLexisPluginEntry(entry));

  /** @type {InstallAction} */
  const action = {
    type: 'merge',
    host: 'opencode',
    scope: installScope,
    to: configPath,
    content: '',
  };

  if (filtered.length === plugins.length) {
    action.type = 'skip';
    action.reason = 'not-configured';
    return action;
  }

  const nextConfig = { ...config };
  if (filtered.length > 0) {
    nextConfig.plugin = filtered;
  } else {
    delete nextConfig.plugin;
  }

  action.content = `${JSON.stringify(nextConfig, null, 2)}\n`;

  if (fs.readFileSync(configPath, 'utf8') === action.content) {
    action.type = 'skip';
    action.reason = 'identical';
    return action;
  }

  action.backup = backupPath(configPath);
  return action;
}

function planOpencodeActions(options, ctx) {
  const host = PLUGIN_HOSTS.opencode;
  const scopes = resolveScopes(options.scope, host);
  /** @type {InstallAction[]} */
  const actions = [];

  for (const installScope of scopes) {
    const configPath =
      installScope === 'project'
        ? path.join(ctx.projectDir, 'opencode.json')
        : path.join(getOpencodeConfigDir(ctx.home), 'opencode.json');

    actions.push(planOpencodeConfigMerge(configPath, installScope, options));

    const commandDir =
      installScope === 'project'
        ? path.join(ctx.projectDir, '.opencode', 'commands')
        : path.join(getOpencodeConfigDir(ctx.home), 'commands');

    for (const file of listOpencodeCommandFiles()) {
      actions.push(
        planFileCopy(
          'opencode',
          installScope,
          file.src,
          path.join(commandDir, file.name),
          options,
          false,
        ),
      );
    }
  }

  return actions;
}

function planOpencodeUninstallActions(options, ctx) {
  const host = PLUGIN_HOSTS.opencode;
  const scopes = resolveScopes(options.scope, host);
  /** @type {InstallAction[]} */
  const actions = [];

  for (const installScope of scopes) {
    const configPath =
      installScope === 'project'
        ? path.join(ctx.projectDir, 'opencode.json')
        : path.join(getOpencodeConfigDir(ctx.home), 'opencode.json');

    actions.push(planOpencodeConfigUninstall(configPath, installScope));

    const commandDir =
      installScope === 'project'
        ? path.join(ctx.projectDir, '.opencode', 'commands')
        : path.join(getOpencodeConfigDir(ctx.home), 'commands');

    for (const file of listOpencodeCommandFiles()) {
      actions.push(
        planFileRemove(
          'opencode',
          installScope,
          path.join(commandDir, file.name),
          file.src,
        ),
      );
    }
  }

  return actions;
}

function buildHintActions(hostIds, ctx) {
  return hostIds.filter(isHintHost).map((hostId) => {
    const host = HINT_HOSTS[hostId];
    return {
      type: 'hint',
      host: hostId,
      scope: 'project',
      to: host.label,
      lines: host.getHints(ctx),
    };
  });
}

function buildUninstallPlan(hostIds, options, ctx) {
  validateHostIds(hostIds);

  /** @type {InstallAction[]} */
  const actions = [];

  for (const hostId of hostIds) {
    if (hostId === 'opencode') {
      actions.push(...planOpencodeUninstallActions(options, ctx));
      continue;
    }

    const host = RULE_HOSTS[hostId];
    const scopes = resolveScopes(options.scope, host);
    const packageSrc = path.join(PACKAGE_ROOT, host.src);

    for (const installScope of scopes) {
      const targetPath =
        installScope === 'project'
          ? path.join(ctx.projectDir, host.projectDest)
          : host.globalDest(ctx.home);

      actions.push(planFileRemove(host.id, installScope, targetPath, packageSrc));
    }

    if (hostId === 'cursor') {
      actions.push(...planCursorSkillRemoves(ctx, options));
    }
  }

  return actions;
}

function buildPlan(hostIds, options, ctx) {
  validateHostIds(hostIds);

  /** @type {InstallAction[]} */
  const actions = [];

  for (const hostId of hostIds) {
    if (hostId === 'opencode') {
      actions.push(...planOpencodeActions(options, ctx));
      continue;
    }

    const host = RULE_HOSTS[hostId];
    const scopes = resolveScopes(options.scope, host);

    for (const installScope of scopes) {
      const destPath =
        installScope === 'project'
          ? path.join(ctx.projectDir, host.projectDest)
          : host.globalDest(ctx.home);

      actions.push(planCopyAction(host, installScope, destPath, options));
    }

    if (hostId === 'cursor') {
      actions.push(...planCursorSkillCopies(options, ctx));
    }
  }

  return actions;
}

function formatAction(action) {
  if (action.type === 'skip') {
    return `skip  ${action.host} (${action.scope}) → ${action.to} [${action.reason}]`;
  }
  if (action.type === 'hint') {
    return `hint  ${action.host} → ${action.to}`;
  }
  const backup = action.backup ? ` (backup → ${action.backup})` : '';
  if (action.type === 'merge') {
    return `merge ${action.host} (${action.scope}) → ${action.to}${backup}`;
  }
  if (action.type === 'remove') {
    return `remove ${action.host} (${action.scope}) → ${action.to}${backup}`;
  }
  return `copy  ${action.host} (${action.scope}) → ${action.to}${backup}`;
}

function printPlan(actions, options) {
  if (actions.length === 0) {
    console.log(options.uninstall ? 'No uninstall actions planned.' : 'No install actions planned.');
    return;
  }

  const mode = options.uninstall ? 'uninstall' : 'install';
  const prefix = options.dryRun ? `Dry run — planned ${mode} actions:` : `Planned ${mode} actions:`;
  console.log(prefix);
  for (const action of actions) {
    console.log(`  ${formatAction(action)}`);
    if (action.type === 'hint' && action.lines) {
      for (const line of action.lines) {
        console.log(`    ${line}`);
      }
    }
  }
}

function executePlan(actions) {
  let applied = 0;
  let skipped = 0;

  for (const action of actions) {
    if (action.type === 'skip' || action.type === 'hint') {
      skipped += 1;
      continue;
    }

    fs.mkdirSync(path.dirname(action.to), { recursive: true });

    if (action.backup && fs.existsSync(action.to)) {
      fs.copyFileSync(action.to, action.backup);
    }

    if (action.type === 'remove') {
      fs.unlinkSync(action.to);
    } else if (action.type === 'merge') {
      fs.writeFileSync(action.to, action.content, 'utf8');
    } else {
      fs.copyFileSync(action.from, action.to);
    }

    applied += 1;
  }

  return { applied, skipped };
}

function printHelp() {
  console.log(`lexis-two install — copy Lexis-Two rules, merge OpenCode config, or uninstall

Usage:
  npx @draig/lexis-two install [options]
  lexis-two install [options]

Options:
  --host <id[,id]>     Hosts: cursor, windsurf, cline, kiro, agents, opencode,
                       copilot-repo, claude, copilot, gemini, pi
  --scope <scope>      project | global | both (default: project)
  --project-dir <path> Target project directory (default: cwd)
  --uninstall          Remove Lexis-Two files installed by this tool
  --dry-run            Print actions without writing files
  --yes, -y            Skip confirmation prompt
  --force              Overwrite existing files (AGENTS.md requires this)
  --non-interactive    Do not prompt; requires --host and --yes
  --help, -h           Show this help

Safety:
  Uninstall only removes files identical to the package (skips modified files).
  Overwrites and uninstalls create a .bak backup first when the target exists.

Examples:
  npx @draig/lexis-two install --host cursor,agents --scope project --yes
  npx @draig/lexis-two install --host opencode --scope project --yes
  npx @draig/lexis-two install --host claude,gemini --yes
  npx @draig/lexis-two install --uninstall --host cursor --scope project --yes
`);
}

function question(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function resolveHosts(options, ctx) {
  if (options.hosts.length > 0) {
    return options.hosts;
  }

  const detected = detectHosts(ctx);
  if (detected.length === 0) {
    const verb = options.uninstall ? 'Uninstall' : 'Install';
    console.log(`No hosts detected. Use --host cursor,agents to ${verb.toLowerCase()} manually.`);
    return [];
  }

  if (!options.interactive) {
    console.log(`Detected hosts: ${detected.join(', ')}`);
    console.log('Re-run with --host <ids> --yes to install without prompts.');
    return [];
  }

  const promptVerb = options.uninstall ? 'Uninstall' : 'Install';
  const answer = await question(
    `${promptVerb} for [${detected.join(', ')}]? (Y/n or comma list): `,
  );

  if (!answer || answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    return detected;
  }
  if (answer.toLowerCase() === 'n' || answer.toLowerCase() === 'no') {
    return [];
  }

  return [...new Set(splitList(answer))];
}

async function confirmPlan(options) {
  if (options.yes || options.dryRun || !options.interactive) {
    return true;
  }

  const answer = await question(
    options.uninstall ? 'Proceed with uninstall? (Y/n): ' : 'Proceed? (Y/n): ',
  );
  return !answer || answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

function printNextSteps(hostIds) {
  const lines = ['Done. Next steps:'];

  if (hostIds.includes('cursor')) {
    lines.push(
      '  • Cursor: open your project — lexis-two.mdc + skills under .cursor/skills/ should load.',
    );
  }
  if (hostIds.includes('agents')) {
    lines.push('  • Generic agents: load AGENTS.md from your project root.');
  }
  if (hostIds.includes('opencode')) {
    lines.push('  • OpenCode: restart the TUI, then run /lexis status.');
  }
  if (hostIds.some(isHintHost)) {
    lines.push('  • Plugin hosts: follow the setup hints printed above.');
  }
  if (hostIds.some((id) => !['agents', 'opencode', 'cursor'].includes(id) && !isHintHost(id))) {
    lines.push('  • More hosts: see docs/setup.md');
  }

  console.log(lines.join('\n'));
}

async function runInstall(rawArgv) {
  const options = parseArgs(rawArgv);

  if (options.help) {
    printHelp();
    return 0;
  }

  const ctx = createContext(options.projectDir);
  const hostIds = await resolveHosts(options, ctx);

  if (hostIds.length === 0) {
    return 0;
  }

  const hintHostIds = hostIds.filter(isHintHost);
  const actionHostIds = hostIds.filter((hostId) => !isHintHost(hostId));

  const actions = options.uninstall
    ? buildUninstallPlan(actionHostIds, options, ctx)
    : [
        ...buildPlan(actionHostIds, options, ctx),
        ...buildHintActions(hintHostIds, ctx),
      ];
  printPlan(actions, options);

  const confirmed = await confirmPlan(options);
  if (!confirmed) {
    console.log(options.uninstall ? 'Uninstall cancelled.' : 'Install cancelled.');
    return 0;
  }

  if (options.dryRun) {
    return 0;
  }

  const result = executePlan(actions);
  const verb = options.uninstall ? 'Uninstalled' : 'Installed';
  console.log(`${verb}: ${result.applied} file(s), skipped: ${result.skipped}.`);

  if (!options.uninstall) {
    printNextSteps(hostIds);
  }
  return 0;
}

async function main() {
  try {
    const code = await runInstall(process.argv.slice(2));
    process.exit(code);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`lexis-two install failed: ${message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  RULE_HOSTS,
  PLUGIN_HOSTS,
  HINT_HOSTS,
  parseArgs,
  detectHosts,
  buildPlan,
  buildUninstallPlan,
  buildHintActions,
  executePlan,
  createContext,
  runInstall,
  getOpencodeConfigDir,
  isLexisPluginEntry,
  isHintHost,
  planOpencodeConfigMerge,
  planOpencodeConfigUninstall,
  listPortableSkillDirs,
  cursorSkillDest,
  backupPath,
};
