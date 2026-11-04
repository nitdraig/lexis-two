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
  HINT_HOSTS,
  buildPlan,
  buildUninstallPlan,
  buildHintActions,
  createContext,
  detectHosts,
  executePlan,
  getOpencodeConfigDir,
  isHintHost,
  listPortableSkillDirs,
  listStackFiles,
  parseArgs,
} = require('../scripts/install.js');

const OPENCODE_ENV_KEYS = ['XDG_CONFIG_HOME', 'OPENCODE_CONFIG_DIR'];

function withoutOpencodeEnvOverrides(env) {
  const next = { ...env };
  for (const key of OPENCODE_ENV_KEYS) {
    delete next[key];
  }
  return next;
}

function runCli(args, projectDir) {
  return spawnSync(process.execPath, [installScript, 'install', ...args], {
    cwd: root,
    encoding: 'utf8',
    env: withoutOpencodeEnvOverrides({
      ...process.env,
      USERPROFILE: projectDir,
      HOME: projectDir,
    }),
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
  const skillCount = listPortableSkillDirs().length;
  const stackCount = listStackFiles().length;

  assert.equal(actions.length, 1 + skillCount + stackCount);
  assert.equal(actions[0].type, 'copy');
  assert.equal(actions[0].host, 'cursor');
  assert.equal(
    actions[0].to,
    path.join(temp, '.cursor', 'rules', 'lexis-two.mdc'),
  );
  assert.equal(
    actions[1].to,
    path.join(temp, '.cursor', 'skills', listPortableSkillDirs()[0].name, 'SKILL.md'),
  );
});

test('buildPlan skips existing AGENTS.md without --force', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-install-agents-'));
  fs.writeFileSync(path.join(temp, 'AGENTS.md'), '# custom\n', 'utf8');

  const ctx = createContext(temp);
  const actions = buildPlan(['agents'], { scope: 'project', force: false }, ctx);

  const agentsAction = actions.find((a) => a.host === 'agents');
  assert.ok(agentsAction);
  assert.equal(agentsAction.type, 'skip');
  assert.equal(agentsAction.reason, 'exists');
});

test('executePlan is idempotent for identical files', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-install-idem-'));
  const ctx = createContext(temp);
  const skillCount = listPortableSkillDirs().length;
  const stackCount = listStackFiles().length;

  const first = buildPlan(['cursor'], { scope: 'project', force: false }, ctx);
  assert.equal(executePlan(first).applied, 1 + skillCount + stackCount);

  const second = buildPlan(['cursor'], { scope: 'project', force: false }, ctx);
  assert.equal(second.every((action) => action.type === 'skip'), true);
  assert.equal(second.every((action) => action.reason === 'identical'), true);
  assert.equal(executePlan(second).skipped, 1 + skillCount + stackCount);
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

  const reviewSkill = path.join(temp, '.cursor', 'skills', 'lexis-two-review', 'SKILL.md');
  assert.equal(fs.existsSync(reviewSkill), true);
  assert.match(fs.readFileSync(reviewSkill, 'utf8'), /lexis-two-review/);

  const stackFile = path.join(temp, 'stacks', 'node-ts.md');
  assert.equal(fs.existsSync(stackFile), true);
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

test('buildPlan skips opencode merge for versioned @draig/lexis-two@x.y.z', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-install-opencode-pin-'));
  const configPath = path.join(temp, 'opencode.json');
  fs.writeFileSync(
    configPath,
    JSON.stringify({ plugin: ['@draig/lexis-two@1.3.0'] }, null, 2),
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
  assert.equal(fs.existsSync(path.join(temp, '.opencode', 'commands', 'specx.md')), true);
  assert.equal(fs.existsSync(path.join(temp, '.opencode', 'commands', 'discx.md')), true);
  assert.equal(fs.existsSync(path.join(temp, '.opencode', 'commands', 'desx.md')), true);
  assert.equal(fs.existsSync(path.join(temp, '.opencode', 'commands', 'slopx.md')), true);
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

  const agentsAction = actions.find((a) => a.host === 'agents');
  assert.ok(agentsAction);
  assert.equal(agentsAction.type, 'skip');
  assert.equal(agentsAction.reason, 'modified');
});

test('buildPlan agents copies stacks/ to project root', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-install-stacks-'));
  const ctx = createContext(temp);
  const actions = buildPlan(['agents'], { scope: 'project', force: false }, ctx);

  const stackActions = actions.filter((a) => a.host === 'stacks');
  assert.equal(stackActions.length, listStackFiles().length);
  assert.ok(
    stackActions.some((a) => a.to === path.join(temp, 'stacks', 'node-ts.md')),
  );
});

test('stack files skip existing without --force and overwrite with --force', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-install-stacks-overwrite-'));
  const ctx = createContext(temp);

  executePlan(buildPlan(['agents'], { scope: 'project', force: false }, ctx));
  const nodeTs = path.join(temp, 'stacks', 'node-ts.md');
  assert.equal(fs.existsSync(nodeTs), true);

  fs.writeFileSync(nodeTs, '# customized\n', 'utf8');
  const noForce = buildPlan(['agents'], { scope: 'project', force: false }, ctx);
  const noForceNode = noForce.find((a) => a.host === 'stacks' && a.to === nodeTs);
  assert.equal(noForceNode.type, 'skip');
  assert.equal(noForceNode.reason, 'exists');

  const withForce = buildPlan(['agents'], { scope: 'project', force: true }, ctx);
  const forceNode = withForce.find((a) => a.host === 'stacks' && a.to === nodeTs);
  assert.equal(forceNode.type, 'copy');
  executePlan(withForce);
  assert.equal(
    fs.readFileSync(nodeTs, 'utf8'),
    fs.readFileSync(path.join(root, 'stacks', 'node-ts.md'), 'utf8'),
  );
  assert.equal(fs.existsSync(`${nodeTs}.bak`), true);
});

test('buildUninstallPlan removes identical stack files', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-install-stacks-uninstall-'));
  const ctx = createContext(temp);

  executePlan(buildPlan(['agents'], { scope: 'project', force: false }, ctx));
  const nodeTs = path.join(temp, 'stacks', 'node-ts.md');
  assert.equal(fs.existsSync(nodeTs), true);

  const uninstallActions = buildUninstallPlan(['agents'], { scope: 'project' }, ctx);
  const remove = uninstallActions.find((a) => a.host === 'stacks' && a.to === nodeTs);
  assert.equal(remove.type, 'remove');
  executePlan(uninstallActions);
  assert.equal(fs.existsSync(nodeTs), false);
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

test('getOpencodeConfigDir uses ~/.config/opencode by default', (t) => {
  const saved = Object.fromEntries(
    OPENCODE_ENV_KEYS.map((key) => [key, process.env[key]]),
  );
  t.after(() => {
    for (const key of OPENCODE_ENV_KEYS) {
      if (saved[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = saved[key];
      }
    }
  });
  for (const key of OPENCODE_ENV_KEYS) {
    delete process.env[key];
  }

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

function hintedPackagePaths() {
  const normalize = (value) => value.replace(/\\/g, '/');
  const rootForms = [normalize(root), `~${normalize(root.slice(os.homedir().length))}`];
  const pathToken = /(?:^|[\s"'])([\w.-]+(?:\/[\w.-]+)*(?:\.(?:json|md)|\/))(?=[\s"',.)]|$)/g;

  const paths = new Set();
  for (const host of Object.values(HINT_HOSTS)) {
    for (const hint of host.getHints()) {
      let line = normalize(hint).replace(/https?:\S+/g, '');
      for (const form of rootForms) line = line.split(`${form}/`).join('').split(form).join('');
      for (const match of line.matchAll(pathToken)) paths.add(match[1]);
    }
  }
  return [...paths];
}

test('every package path shown in installer hints is published', () => {
  const mentioned = hintedPackagePaths();
  // lexis: guards the token regex — an empty match list would pass the check below
  for (const known of ['.claude-plugin/plugin.json', '.github/plugin/plugin.json', 'gemini-extension.json']) {
    assert.ok(mentioned.includes(known), `hint scan did not find ${known}: ${mentioned}`);
  }

  // lexis: shell — npm is a .cmd on Windows
  const pack = spawnSync('npm pack --dry-run --json --ignore-scripts', {
    cwd: root,
    encoding: 'utf8',
    shell: true,
  });
  assert.equal(pack.status, 0, pack.stderr);
  const published = JSON.parse(pack.stdout)[0].files.map((file) => file.path);

  const missing = mentioned.filter((p) =>
    p.endsWith('/') ? !published.some((file) => file.startsWith(p)) : !published.includes(p),
  );
  assert.deepEqual(missing, []);
});

// ---------------------------------------------------------------------------
// Installer safety: backups, shared stacks/, scopes, confirmation
// ---------------------------------------------------------------------------

function tempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function runCliWithHome(args, home) {
  return spawnSync(process.execPath, [installScript, 'install', ...args], {
    cwd: root,
    encoding: 'utf8',
    env: withoutOpencodeEnvOverrides({ ...process.env, USERPROFILE: home, HOME: home }),
  });
}

test('a second --force never overwrites the first backup', () => {
  const temp = tempDir('lexis-install-bak-');
  const ctx = createContext(temp);
  const target = path.join(temp, 'AGENTS.md');

  fs.writeFileSync(target, 'ORIGINAL');
  executePlan(buildPlan(['agents'], { scope: 'project', force: true }, ctx));
  fs.writeFileSync(target, 'SECOND EDIT');
  executePlan(buildPlan(['agents'], { scope: 'project', force: true }, ctx));

  assert.equal(fs.readFileSync(`${target}.bak`, 'utf8'), 'ORIGINAL');
  assert.equal(fs.readFileSync(`${target}.bak.1`, 'utf8'), 'SECOND EDIT');
});

test('uninstalling one rule host keeps stacks/ while another still needs it', () => {
  const temp = tempDir('lexis-install-shared-stacks-');
  const ctx = createContext(temp);
  const stackFile = path.join(temp, 'stacks', 'node-ts.md');
  const windsurf = path.join(temp, '.windsurf', 'rules', 'lexis-two.md');
  const cline = path.join(temp, '.clinerules', 'lexis-two.md');

  executePlan(buildPlan(['windsurf', 'cline'], { scope: 'project', force: false }, ctx));
  assert.equal(fs.existsSync(stackFile), true);

  const first = buildUninstallPlan(['windsurf'], { scope: 'project' }, ctx);
  assert.ok(first.some((a) => a.host === 'stacks' && a.type === 'skip' && /still used by cline/.test(a.reason)));
  executePlan(first);
  assert.equal(fs.existsSync(windsurf), false);
  assert.equal(fs.existsSync(cline), true);
  assert.equal(fs.existsSync(stackFile), true, 'stacks/ must stay for cline');

  executePlan(buildUninstallPlan(['cline'], { scope: 'project' }, ctx));
  assert.equal(fs.existsSync(stackFile), false, 'the last host takes stacks/ with it');
});

test('a host whose file was modified keeps stacks/ in place on uninstall', () => {
  const temp = tempDir('lexis-install-modified-stacks-');
  const ctx = createContext(temp);
  executePlan(buildPlan(['windsurf', 'cline'], { scope: 'project', force: false }, ctx));
  fs.appendFileSync(path.join(temp, '.clinerules', 'lexis-two.md'), '\nmy own rule\n');

  executePlan(buildUninstallPlan(['windsurf', 'cline'], { scope: 'project' }, ctx));
  assert.equal(fs.existsSync(path.join(temp, '.clinerules', 'lexis-two.md')), true);
  assert.equal(fs.existsSync(path.join(temp, 'stacks', 'node-ts.md')), true);
});

test('stacks/ stays while an OpenCode project install needs it', () => {
  const temp = tempDir('lexis-install-opencode-stacks-');
  const ctx = createContext(temp);
  executePlan(buildPlan(['opencode', 'windsurf'], { scope: 'project', force: false }, ctx));

  executePlan(buildUninstallPlan(['windsurf'], { scope: 'project' }, ctx));
  assert.equal(fs.existsSync(path.join(temp, 'stacks', 'node-ts.md')), true);
});

test('--scope global writes nothing to the project and warns', () => {
  const project = tempDir('lexis-install-global-project-');
  const home = tempDir('lexis-install-global-home-');
  const result = runCliWithHome(
    ['--host', 'windsurf,cursor', '--scope', 'global', '--yes', '--project-dir', project, '--non-interactive'],
    home,
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(fs.readdirSync(project), [], 'project directory must stay empty');
  assert.equal(fs.existsSync(path.join(home, '.cursor', 'rules', 'lexis-two.mdc')), true);
  assert.match(result.stdout, /Windsurf does not support --scope global; nothing installed for it/);
  assert.match(result.stdout, /Global rules cannot load \.\/stacks\/ profiles/);
});

test('a host without global support installs nothing and plans no stacks for --scope global', () => {
  const temp = tempDir('lexis-install-unsupported-');
  const ctx = createContext(temp);
  const actions = buildPlan(['windsurf'], { scope: 'global', force: false }, ctx);

  assert.equal(actions.length, 1);
  assert.equal(actions[0].type, 'skip');
  assert.match(actions[0].reason, /does not support --scope global/);
  assert.equal(actions.some((a) => a.host === 'stacks'), false);
});

test('without a TTY and without --yes a writing plan fails and writes nothing', () => {
  const temp = tempDir('lexis-install-notty-');
  const cursorRule = path.join(temp, '.cursor', 'rules', 'lexis-two.mdc');

  for (const extra of [[], ['--non-interactive']]) {
    const result = runCli(['--host', 'cursor', '--project-dir', temp, ...extra], temp);
    assert.equal(result.status, 1, extra.join(' '));
    assert.match(result.stderr, /no TTY and no --yes/);
    assert.equal(fs.existsSync(cursorRule), false);
  }

  const dry = runCli(['--host', 'cursor', '--project-dir', temp, '--dry-run'], temp);
  assert.equal(dry.status, 0, dry.stderr);
  assert.equal(fs.existsSync(cursorRule), false);

  const hintOnly = runCli(['--host', 'claude', '--project-dir', temp], temp);
  assert.equal(hintOnly.status, 0, hintOnly.stderr);

  const confirmed = runCli(['--host', 'cursor', '--project-dir', temp, '--yes'], temp);
  assert.equal(confirmed.status, 0, confirmed.stderr);
  assert.equal(fs.existsSync(cursorRule), true);
});

test('template stack files are not copied to user projects', () => {
  assert.equal(fs.existsSync(path.join(root, 'stacks', '_template.md')), true);
  assert.equal(listStackFiles().some((file) => file.name.startsWith('_')), false);

  const temp = tempDir('lexis-install-no-template-');
  executePlan(buildPlan(['agents'], { scope: 'project', force: false }, createContext(temp)));
  assert.equal(fs.existsSync(path.join(temp, 'stacks', '_template.md')), false);
  assert.equal(fs.existsSync(path.join(temp, 'stacks', 'node-ts.md')), true);
});

// ---------------------------------------------------------------------------
// Upgrade and uninstall through the install manifest
// ---------------------------------------------------------------------------

const crypto = require('crypto');

const sha = (text) => crypto.createHash('sha256').update(text.replace(/\r\n/g, '\n')).digest('hex');
const manifestFile = (temp) => path.join(temp, '.lexis-two', 'manifest.json');
const readManifestJson = (temp) => JSON.parse(fs.readFileSync(manifestFile(temp), 'utf8'));

// Installs windsurf (rule + stacks) into a fresh project and returns the project and the rule path.
function installedProject() {
  const temp = tempDir('lexis-install-upgrade-');
  const ctx = createContext(temp);
  executePlan(buildPlan(['windsurf'], { scope: 'project', force: false }, ctx), ctx);
  return { temp, ctx, rule: path.join(temp, '.windsurf', 'rules', 'lexis-two.md') };
}

// Pretend the installed file came from an older package version: other content, manifest hash to match.
function makeOlderInstall(temp, filePath, content) {
  fs.writeFileSync(filePath, content);
  const manifest = readManifestJson(temp);
  const key = path.relative(temp, filePath).split(path.sep).join('/');
  manifest.files[key].sha256 = sha(content);
  fs.writeFileSync(manifestFile(temp), JSON.stringify(manifest));
}

test('install records every written file with its hash, relative to the project', () => {
  const { temp, rule } = installedProject();
  const manifest = readManifestJson(temp);

  assert.equal(manifest.version, 1);
  const entry = manifest.files['.windsurf/rules/lexis-two.md'];
  assert.equal(entry.host, 'windsurf');
  assert.equal(entry.sha256, sha(fs.readFileSync(rule, 'utf8')));
  assert.equal(manifest.files['stacks/node-ts.md'].host, 'stacks');
  assert.equal(Object.keys(manifest.files).some((k) => path.isAbsolute(k)), false);
});

test('reinstall after a package upgrade updates an unedited file without --force and without a backup', () => {
  const { temp, ctx, rule } = installedProject();
  makeOlderInstall(temp, rule, 'OLD PACKAGE CONTENT');

  const plan = buildPlan(['windsurf'], { scope: 'project', force: false }, ctx);
  const action = plan.find((a) => a.to === rule);
  assert.equal(action.type, 'copy');
  assert.equal(action.update, true);
  assert.equal(action.backup, undefined);

  executePlan(plan, ctx);
  assert.equal(fs.readFileSync(rule, 'utf8'), fs.readFileSync(path.join(root, '.windsurf', 'rules', 'lexis-two.md'), 'utf8'));
  assert.equal(fs.existsSync(`${rule}.bak`), false);
  assert.equal(readManifestJson(temp).files['.windsurf/rules/lexis-two.md'].sha256, sha(fs.readFileSync(rule, 'utf8')));
});

test('a file the user edited survives reinstall and uninstall, and is reported', () => {
  const { temp, ctx, rule } = installedProject();
  makeOlderInstall(temp, rule, 'OLD PACKAGE CONTENT');
  fs.appendFileSync(rule, '\nmy own rule\n');

  const reinstall = buildPlan(['windsurf'], { scope: 'project', force: false }, ctx).find((a) => a.to === rule);
  assert.equal(reinstall.type, 'skip');
  assert.equal(reinstall.reason, 'edited');

  const uninstall = buildUninstallPlan(['windsurf'], { scope: 'project' }, ctx).find((a) => a.to === rule);
  assert.equal(uninstall.type, 'skip');
  assert.equal(uninstall.reason, 'modified');

  executePlan(buildUninstallPlan(['windsurf'], { scope: 'project' }, ctx), ctx);
  assert.match(fs.readFileSync(rule, 'utf8'), /my own rule/);
  assert.ok(readManifestJson(temp).files['.windsurf/rules/lexis-two.md'], 'still tracked');
});

test('uninstall after a package upgrade removes the unedited file and the empty manifest', () => {
  const { temp, ctx, rule } = installedProject();
  makeOlderInstall(temp, rule, 'OLD PACKAGE CONTENT');

  const plan = buildUninstallPlan(['windsurf'], { scope: 'project' }, ctx);
  const action = plan.find((a) => a.to === rule);
  assert.equal(action.type, 'remove');
  assert.equal(action.backup, undefined, 'the content is reproducible from the package');

  executePlan(plan, ctx);
  assert.equal(fs.existsSync(rule), false);
  assert.equal(fs.existsSync(path.join(temp, 'stacks', 'node-ts.md')), false);
  assert.equal(fs.existsSync(path.join(temp, '.lexis-two')), false, 'nothing left to track');
});

test('line-ending changes are not read as a user edit', () => {
  const { ctx, rule } = installedProject();
  const text = fs.readFileSync(rule, 'utf8');
  fs.writeFileSync(rule, text.replace(/\r?\n/g, '\r\n'));

  const plan = buildUninstallPlan(['windsurf'], { scope: 'project' }, ctx);
  assert.equal(plan.find((a) => a.to === rule).type, 'remove');
});

test('reinstall removes unedited files the package no longer ships, and keeps edited ones', () => {
  const { temp, ctx } = installedProject();
  const gone = path.join(temp, '.windsurf', 'rules', 'old-rule.md');
  const edited = path.join(temp, '.windsurf', 'rules', 'old-edited.md');
  fs.writeFileSync(gone, 'shipped once');
  fs.writeFileSync(edited, 'shipped once');
  const manifest = readManifestJson(temp);
  manifest.files['.windsurf/rules/old-rule.md'] = { host: 'windsurf', sha256: sha('shipped once') };
  manifest.files['.windsurf/rules/old-edited.md'] = { host: 'windsurf', sha256: sha('shipped once') };
  fs.writeFileSync(manifestFile(temp), JSON.stringify(manifest));
  fs.writeFileSync(edited, 'the user changed this');

  const plan = buildPlan(['windsurf'], { scope: 'project', force: false }, ctx);
  assert.equal(plan.find((a) => a.to === gone).type, 'remove');
  assert.equal(plan.find((a) => a.to === edited).type, 'skip');

  executePlan(plan, ctx);
  assert.equal(fs.existsSync(gone), false);
  assert.equal(fs.readFileSync(edited, 'utf8'), 'the user changed this');
  assert.equal(readManifestJson(temp).files['.windsurf/rules/old-rule.md'], undefined);
});

test('a manifest entry that points outside the project is rejected', () => {
  const { temp, ctx } = installedProject();
  const manifest = readManifestJson(temp);
  manifest.files['../outside.txt'] = { host: 'windsurf', sha256: sha('x') };
  fs.writeFileSync(manifestFile(temp), JSON.stringify(manifest));

  assert.throws(() => buildPlan(['windsurf'], { scope: 'project', force: false }, ctx), /outside the allowed directory/);
  assert.throws(() => buildUninstallPlan(['windsurf'], { scope: 'project' }, ctx), /outside the allowed directory/);
});

test('the global manifest rejects absolute paths outside the home and OpenCode config directories', () => {
  const temp = tempDir('lexis-install-global-manifest-');
  const home = tempDir('lexis-install-global-manifest-home-');
  const ctx = { ...createContext(temp), home };
  const file = path.join(home, '.config', 'lexis-two', 'manifest.json');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const outside = path.join(os.tmpdir(), 'somewhere-else', 'x.md').split(path.sep).join('/');
  fs.writeFileSync(file, JSON.stringify({ version: 1, files: { [outside]: { host: 'cursor', sha256: sha('x') } } }));

  assert.throws(() => buildPlan(['cursor'], { scope: 'global', force: false }, ctx), /outside the allowed directory/);
});

test('a corrupt manifest stops the run and changes nothing', () => {
  const { temp, ctx, rule } = installedProject();
  const before = fs.readFileSync(rule, 'utf8');

  for (const broken of ['{ not json', JSON.stringify({ version: 2, files: {} }), JSON.stringify({ version: 1, files: { a: { host: 'x', sha256: 'zz' } } })]) {
    fs.writeFileSync(manifestFile(temp), broken);
    assert.throws(() => buildPlan(['windsurf'], { scope: 'project', force: false }, ctx), /manifest .* is .*nothing was changed/i);
    assert.throws(() => buildUninstallPlan(['windsurf'], { scope: 'project' }, ctx), /manifest/);
  }
  assert.equal(fs.readFileSync(rule, 'utf8'), before);
  assert.equal(fs.readFileSync(manifestFile(temp), 'utf8').length > 0, true);
});

test('without a manifest the legacy behavior holds: exists is skipped, identical files are removed with a backup', () => {
  const temp = tempDir('lexis-install-legacy-');
  const ctx = createContext(temp);
  executePlan(buildPlan(['windsurf'], { scope: 'project', force: false }, ctx)); // no ctx: no manifest written
  assert.equal(fs.existsSync(manifestFile(temp)), false);

  const rule = path.join(temp, '.windsurf', 'rules', 'lexis-two.md');
  const removal = buildUninstallPlan(['windsurf'], { scope: 'project' }, ctx).find((a) => a.to === rule);
  assert.equal(removal.type, 'remove');
  assert.ok(removal.backup);
});
