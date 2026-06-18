#!/usr/bin/env node

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const installScript = path.join(root, 'scripts', 'install.js');
const {
  buildPlan,
  buildUninstallPlan,
  buildHintActions,
  createContext,
  detectHosts,
  executePlan,
  getOpencodeConfigDir,
  isHintHost,
  parseArgs,
} = require('../scripts/install.js');

function runCli(args, projectDir) {
  return spawnSync(process.execPath, [installScript, 'install', ...args], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      USERPROFILE: projectDir,
      HOME: projectDir,
    },
  });
}

test('parseArgs accepts host and scope flags', () => {
  const options = parseArgs([
    'install',
    '--host',
    'cursor,agents',
    '--scope',
    'both',
    '--yes',
    '--dry-run',
    '--project-dir',
    '/tmp/demo',
  ]);

  assert.deepEqual(options.hosts, ['cursor', 'agents']);
  assert.equal(options.scope, 'both');
  assert.equal(options.yes, true);
  assert.equal(options.dryRun, true);
  assert.equal(options.projectDir, path.resolve('/tmp/demo'));
});

test('detectHosts always includes agents', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-install-detect-'));
  const ctx = createContext(temp);
  const detected = detectHosts(ctx);
  assert.ok(detected.includes('agents'));
});

test('buildPlan dry-run lists cursor project copy', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-install-plan-'));
  const ctx = createContext(temp);
  const actions = buildPlan(['cursor'], { scope: 'project', force: false }, ctx);

  assert.equal(actions.length, 1);
  assert.equal(actions[0].type, 'copy');
  assert.equal(actions[0].host, 'cursor');
  assert.equal(
    actions[0].to,
    path.join(temp, '.cursor', 'rules', 'lexis-two.mdc'),
  );
});

test('buildPlan skips existing AGENTS.md without --force', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-install-agents-'));
  fs.writeFileSync(path.join(temp, 'AGENTS.md'), '# custom\n', 'utf8');

  const ctx = createContext(temp);
  const actions = buildPlan(['agents'], { scope: 'project', force: false }, ctx);

  assert.equal(actions.length, 1);
  assert.equal(actions[0].type, 'skip');
  assert.equal(actions[0].reason, 'exists');
});

test('executePlan is idempotent for identical files', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-install-idem-'));
  const ctx = createContext(temp);

  const first = buildPlan(['cursor'], { scope: 'project', force: false }, ctx);
  assert.equal(executePlan(first).applied, 1);

  const second = buildPlan(['cursor'], { scope: 'project', force: false }, ctx);
  assert.equal(second[0].type, 'skip');
  assert.equal(second[0].reason, 'identical');
  assert.equal(executePlan(second).skipped, 1);
});

test('CLI dry-run prints copy action without writing files', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-install-cli-'));
  const result = runCli(
    [
      '--host',
      'cursor',
      '--scope',
      'project',
      '--yes',
      '--dry-run',
      '--project-dir',
      temp,
      '--non-interactive',
    ],
    temp,
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Dry run/);
  assert.match(result.stdout, /lexis-two\.mdc/);
  assert.equal(fs.existsSync(path.join(temp, '.cursor', 'rules', 'lexis-two.mdc')), false);
});

test('CLI install writes cursor rule file', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-install-write-'));
  const result = runCli(
    [
      '--host',
      'cursor',
      '--scope',
      'project',
      '--yes',
      '--project-dir',
      temp,
      '--non-interactive',
    ],
    temp,
  );

  assert.equal(result.status, 0, result.stderr);
  const installed = path.join(temp, '.cursor', 'rules', 'lexis-two.mdc');
  assert.equal(fs.existsSync(installed), true);

  const expected = fs.readFileSync(
    path.join(root, '.cursor', 'rules', 'lexis-two.mdc'),
    'utf8',
  );
  assert.equal(fs.readFileSync(installed, 'utf8'), expected);
});

test('buildPlan merges opencode.json without clobbering existing plugins', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-install-opencode-'));
  const configPath = path.join(temp, 'opencode.json');
  fs.writeFileSync(
    configPath,
    JSON.stringify({ plugin: ['other-plugin'], model: 'gpt' }, null, 2),
    'utf8',
  );

  const ctx = createContext(temp);
  const actions = buildPlan(['opencode'], { scope: 'project', force: false }, ctx);
  const mergeAction = actions.find((action) => action.type === 'merge');

  assert.ok(mergeAction);
  assert.equal(mergeAction.to, configPath);
  const merged = JSON.parse(mergeAction.content);
  assert.deepEqual(merged.plugin, ['other-plugin', '@draig/lexis-two']);
  assert.equal(merged.model, 'gpt');
});

test('buildPlan skips opencode merge when lexis plugin already configured', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-install-opencode-skip-'));
  const configPath = path.join(temp, 'opencode.json');
  fs.writeFileSync(
    configPath,
    JSON.stringify({ plugin: ['@draig/lexis-two'] }, null, 2),
    'utf8',
  );

  const ctx = createContext(temp);
  const actions = buildPlan(['opencode'], { scope: 'project', force: false }, ctx);
  const mergeAction = actions.find(
    (action) => action.host === 'opencode' && action.to === configPath,
  );

  assert.equal(mergeAction.type, 'skip');
  assert.equal(mergeAction.reason, 'already-configured');
});

test('CLI install writes opencode.json and slash commands', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-install-opencode-cli-'));
  const result = runCli(
    [
      '--host',
      'opencode',
      '--scope',
      'project',
      '--yes',
      '--project-dir',
      temp,
      '--non-interactive',
    ],
    temp,
  );

  assert.equal(result.status, 0, result.stderr);

  const config = JSON.parse(fs.readFileSync(path.join(temp, 'opencode.json'), 'utf8'));
  assert.ok(config.plugin.includes('@draig/lexis-two'));
  assert.equal(fs.existsSync(path.join(temp, '.opencode', 'commands', 'lexis.md')), true);
  assert.equal(fs.existsSync(path.join(temp, '.opencode', 'commands', 'specxis.md')), true);
});

test('buildUninstallPlan removes cursor file installed by the tool', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-install-uninstall-'));
  const ctx = createContext(temp);

  const installActions = buildPlan(['cursor'], { scope: 'project', force: false }, ctx);
  executePlan(installActions);

  const target = path.join(temp, '.cursor', 'rules', 'lexis-two.mdc');
  assert.equal(fs.existsSync(target), true);

  const uninstallActions = buildUninstallPlan(['cursor'], { scope: 'project' }, ctx);
  const removeAction = uninstallActions.find((action) => action.type === 'remove');
  assert.ok(removeAction);
  executePlan(uninstallActions);
  assert.equal(fs.existsSync(target), false);
  assert.equal(fs.existsSync(`${target}.bak`), true);
});

test('buildUninstallPlan skips modified AGENTS.md', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-install-uninstall-agents-'));
  fs.writeFileSync(path.join(temp, 'AGENTS.md'), '# customized by user\n', 'utf8');

  const ctx = createContext(temp);
  const actions = buildUninstallPlan(['agents'], { scope: 'project' }, ctx);

  assert.equal(actions.length, 1);
  assert.equal(actions[0].type, 'skip');
  assert.equal(actions[0].reason, 'modified');
});

test('buildUninstallPlan removes lexis plugin from opencode.json', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-install-uninstall-oc-'));
  const configPath = path.join(temp, 'opencode.json');
  fs.writeFileSync(
    configPath,
    JSON.stringify({ plugin: ['other-plugin', '@draig/lexis-two'] }, null, 2),
    'utf8',
  );

  const ctx = createContext(temp);
  const actions = buildUninstallPlan(['opencode'], { scope: 'project' }, ctx);
  const mergeAction = actions.find(
    (action) => action.host === 'opencode' && action.to === configPath,
  );

  assert.equal(mergeAction.type, 'merge');
  const merged = JSON.parse(mergeAction.content);
  assert.deepEqual(merged.plugin, ['other-plugin']);

  executePlan(actions);
  const onDisk = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  assert.deepEqual(onDisk.plugin, ['other-plugin']);
  assert.equal(fs.existsSync(`${configPath}.bak`), true);
});

test('CLI uninstall dry-run prints remove actions', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-install-uninstall-cli-'));
  const install = runCli(
    ['--host', 'cursor', '--scope', 'project', '--yes', '--project-dir', temp, '--non-interactive'],
    temp,
  );
  assert.equal(install.status, 0, install.stderr);

  const uninstall = runCli(
    [
      '--uninstall',
      '--host',
      'cursor',
      '--scope',
      'project',
      '--yes',
      '--dry-run',
      '--project-dir',
      temp,
      '--non-interactive',
    ],
    temp,
  );

  assert.equal(uninstall.status, 0, uninstall.stderr);
  assert.match(uninstall.stdout, /uninstall actions/);
  assert.match(uninstall.stdout, /remove/);
  assert.equal(fs.existsSync(path.join(temp, '.cursor', 'rules', 'lexis-two.mdc')), true);
});

test('buildHintActions prints Claude Code setup guidance', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-install-hint-'));
  const ctx = createContext(temp);
  const actions = buildHintActions(['claude'], ctx);

  assert.equal(actions.length, 1);
  assert.equal(actions[0].type, 'hint');
  assert.match(actions[0].lines.join('\n'), /Claude Code/);
  assert.match(actions[0].lines.join('\n'), /lexis-two/);
});

test('CLI prints gemini hint without writing plugin files', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-install-hint-cli-'));
  const result = runCli(
    [
      '--host',
      'gemini',
      '--yes',
      '--dry-run',
      '--project-dir',
      temp,
      '--non-interactive',
    ],
    temp,
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /hint\s+gemini/);
  assert.match(result.stdout, /gemini extensions install/);
});

test('CLI install writes copilot repo instructions when .github exists', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-install-copilot-repo-'));
  fs.mkdirSync(path.join(temp, '.github'), { recursive: true });

  const result = runCli(
    [
      '--host',
      'copilot-repo',
      '--scope',
      'project',
      '--yes',
      '--project-dir',
      temp,
      '--non-interactive',
    ],
    temp,
  );

  assert.equal(result.status, 0, result.stderr);
  const target = path.join(temp, '.github', 'copilot-instructions.md');
  assert.equal(fs.existsSync(target), true);
  assert.match(fs.readFileSync(target, 'utf8'), /lazy senior developer/i);
});

test('getOpencodeConfigDir uses ~/.config/opencode by default', () => {
  const home = path.join(os.tmpdir(), 'lexis-home');
  assert.equal(
    getOpencodeConfigDir(home),
    path.join(home, '.config', 'opencode'),
  );
});

test('CLI global opencode install writes commands under ~/.config/opencode/commands', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-install-opencode-global-'));
  const result = runCli(
    [
      '--host',
      'opencode',
      '--scope',
      'global',
      '--yes',
      '--project-dir',
      temp,
      '--non-interactive',
    ],
    temp,
  );

  assert.equal(result.status, 0, result.stderr);
  const commandPath = path.join(temp, '.config', 'opencode', 'commands', 'lexis.md');
  assert.equal(fs.existsSync(commandPath), true);
});
