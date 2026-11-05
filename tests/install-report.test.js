#!/usr/bin/env node
// Read-only report (--json), the status command, the prompt labels and the version check.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const http = require('http');
const net = require('net');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const installScript = path.join(root, 'scripts', 'install.js');
const pkg = require('../package.json');
const {
  RULE_HOSTS,
  PLUGIN_HOSTS,
  HINT_HOSTS,
  buildPlan,
  buildUninstallPlan,
  buildReport,
  createContext,
  detectHosts,
  executePlan,
  formatStatus,
  isNewer,
  latestVersion,
  notifyUpdate,
  parseArgs,
  promptLabels,
} = require('../scripts/install.js');

const tempDir = (prefix) => fs.mkdtempSync(path.join(os.tmpdir(), prefix));

function scratch() {
  const project = tempDir('lexis-report-project-');
  const home = tempDir('lexis-report-home-');
  return { project, home, ctx: { ...createContext(project), home } };
}

function cli(args, { home, extraEnv = {} }) {
  const env = { ...process.env, USERPROFILE: home, HOME: home, ...extraEnv };
  delete env.XDG_CONFIG_HOME;
  delete env.OPENCODE_CONFIG_DIR;
  delete env.CI;
  return spawnSync(process.execPath, [installScript, ...args], { cwd: root, encoding: 'utf8', env });
}

function listTree(dir) {
  const out = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      out.push(path.relative(dir, full));
      if (entry.isDirectory()) walk(full);
    }
  };
  walk(dir);
  return out.sort();
}

// ---- report ----------------------------------------------------------------------------------------

test('buildReport lists every host once and matches detectHosts', () => {
  const { ctx } = scratch();
  const report = buildReport(ctx);
  const expected = [...Object.keys(RULE_HOSTS), ...Object.keys(PLUGIN_HOSTS), ...Object.keys(HINT_HOSTS)];
  assert.deepEqual(report.hosts.map((host) => host.id), expected);
  assert.deepEqual(
    report.hosts.filter((host) => host.detected).map((host) => host.id).sort(),
    detectHosts(ctx).sort(),
  );
  for (const host of report.hosts) {
    assert.ok(['rules', 'plugin', 'hint'].includes(host.kind), host.id);
    assert.equal(host.installed, 'none', host.id);
  }
});

test('installed state follows the manifest across install and uninstall', () => {
  const { ctx } = scratch();
  const state = () => buildReport(ctx).hosts.find((host) => host.id === 'agents').installed;

  assert.equal(state(), 'none');
  executePlan(buildPlan(['agents'], { scope: 'project', force: true }, ctx), ctx);
  assert.equal(state(), 'project');
  executePlan(buildUninstallPlan(['agents'], { scope: 'project' }, ctx), ctx);
  assert.equal(state(), 'none');
});

test('localRuntimes lists a runtime only when its env var is set', () => {
  const { ctx } = scratch();
  const saved = { o: process.env.OLLAMA_HOST, l: process.env.LMSTUDIO_HOST };
  try {
    delete process.env.OLLAMA_HOST;
    delete process.env.LMSTUDIO_HOST;
    assert.deepEqual(buildReport(ctx).environment.localRuntimes, []);
    process.env.OLLAMA_HOST = 'http://127.0.0.1:11434';
    assert.deepEqual(buildReport(ctx).environment.localRuntimes, ['ollama']);
    process.env.LMSTUDIO_HOST = 'http://127.0.0.1:1234';
    assert.deepEqual(buildReport(ctx).environment.localRuntimes, ['ollama', 'lmstudio']);
  } finally {
    if (saved.o === undefined) delete process.env.OLLAMA_HOST; else process.env.OLLAMA_HOST = saved.o;
    if (saved.l === undefined) delete process.env.LMSTUDIO_HOST; else process.env.LMSTUDIO_HOST = saved.l;
  }
});

test('install --json prints valid JSON, writes nothing and needs no --yes', () => {
  const { project, home } = scratch();
  const before = listTree(project).concat(listTree(home));
  const result = cli(['install', '--json', '--project-dir', project, '--no-update-check'], { home });
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.ok(Array.isArray(report.hosts) && report.hosts.length > 0);
  assert.equal(report.environment.node, process.versions.node);
  assert.deepEqual(listTree(project).concat(listTree(home)), before);
});

test('--json cannot be combined with --host or --uninstall', () => {
  const { project, home } = scratch();
  for (const extra of [['--host', 'cursor'], ['--uninstall']]) {
    const result = cli(['install', '--json', '--project-dir', project, ...extra], { home });
    assert.notEqual(result.status, 0, extra.join(' '));
    assert.match(result.stderr, /--json prints a report/);
  }
});

test('status prints the report view, writes nothing, and fails on a corrupt manifest', () => {
  const { project, home, ctx } = scratch();
  executePlan(buildPlan(['agents'], { scope: 'project', force: true }, ctx), ctx);
  const before = listTree(project);

  const result = cli(['status', '--project-dir', project, '--no-update-check'], { home });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), formatStatus(buildReport(ctx)).trim());
  assert.match(result.stdout, /agents\s+detected: yes\s+installed: project/);
  assert.deepEqual(listTree(project), before);

  fs.writeFileSync(path.join(project, '.lexis-two', 'manifest.json'), '{ not json');
  const broken = cli(['status', '--project-dir', project, '--no-update-check'], { home });
  assert.equal(broken.status, 1);
  assert.match(broken.stderr, /not valid JSON/);
});

test('prompt labels show new or installed for each detected host', () => {
  const report = { hosts: [{ id: 'cursor', installed: 'none' }, { id: 'opencode', installed: 'both' }] };
  assert.deepEqual(promptLabels(['cursor', 'opencode', 'pi'], report), [
    'cursor (new)',
    'opencode (installed)',
    'pi (new)',
  ]);
});

test('--check needs status; status and install parse as commands', () => {
  assert.throws(() => parseArgs(['install', '--check']), /only valid with the status command/);
  assert.equal(parseArgs(['status', '--check']).check, true);
  assert.equal(parseArgs(['status']).command, 'status');
  assert.equal(parseArgs(['--host', 'cursor']).command, 'install');
});

// ---- version check ---------------------------------------------------------------------------------

function fakeRegistry(handler) {
  const requests = [];
  const server = http.createServer((req, res) => {
    requests.push(req.url);
    handler(req, res);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve({
        url: `http://127.0.0.1:${server.address().port}/latest`,
        requests,
        close: () => new Promise((done) => { server.closeAllConnections(); server.close(done); }),
      });
    });
  });
}

const json = (body, status = 200) => (_req, res) => {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(body);
};

test('latestVersion returns the version on 200 and null on every failure', async () => {
  const ok = await fakeRegistry(json(JSON.stringify({ version: '9.9.9' })));
  const missing = await fakeRegistry(json('{}', 404));
  const garbage = await fakeRegistry(json('<html>'));
  const noVersion = await fakeRegistry(json(JSON.stringify({ name: 'x' })));
  const hang = await fakeRegistry(() => {});
  try {
    assert.equal(await latestVersion({ registryUrl: ok.url }), '9.9.9');
    assert.equal(await latestVersion({ registryUrl: missing.url }), null);
    assert.equal(await latestVersion({ registryUrl: garbage.url }), null);
    assert.equal(await latestVersion({ registryUrl: noVersion.url }), null);

    const started = Date.now();
    assert.equal(await latestVersion({ registryUrl: hang.url, timeoutMs: 300 }), null);
    assert.ok(Date.now() - started < 3000, 'the timeout is honored');
  } finally {
    await Promise.all([ok, missing, garbage, noVersion, hang].map((server) => server.close()));
  }

  // A closed port: grab a free one, then release it.
  const port = await new Promise((resolve) => {
    const probe = net.createServer().listen(0, '127.0.0.1', () => {
      const { port: free } = probe.address();
      probe.close(() => resolve(free));
    });
  });
  assert.equal(await latestVersion({ registryUrl: `http://127.0.0.1:${port}/latest` }), null);
  assert.equal(await latestVersion({ registryUrl: 'not a url' }), null);
});

test('isNewer compares plain major.minor.patch only', () => {
  assert.equal(isNewer('1.5.1', '1.5.0'), true);
  assert.equal(isNewer('1.10.0', '1.9.0'), true);
  assert.equal(isNewer('2.0.0', '1.99.99'), true);
  assert.equal(isNewer('1.5.0', '1.5.0'), false);
  assert.equal(isNewer('1.4.9', '1.5.0'), false);
  assert.equal(isNewer('1.6.0-beta.1', '1.5.0'), false);
  assert.equal(isNewer('abc', '1.5.0'), false);
  assert.equal(isNewer('1.6.0', 'abc'), false);
});

// Runs notifyUpdate as if attached to a terminal, against a fake registry, and returns the output.
async function runNotify(args, { latest, env = {}, force = false }) {
  const registry = await fakeRegistry(json(JSON.stringify({ version: latest })));
  const saved = {
    registry: process.env.LEXIS_TWO_REGISTRY_URL,
    ci: process.env.CI,
    optOut: process.env.LEXIS_TWO_NO_UPDATE_CHECK,
    tty: process.stdout.isTTY,
    log: console.log,
  };
  const lines = [];
  try {
    process.env.LEXIS_TWO_REGISTRY_URL = registry.url;
    delete process.env.CI;
    delete process.env.LEXIS_TWO_NO_UPDATE_CHECK;
    Object.assign(process.env, env);
    process.stdout.isTTY = true;
    console.log = (line) => lines.push(String(line));
    const options = parseArgs(args);
    options.interactive = true;
    await notifyUpdate(options, { force });
  } finally {
    console.log = saved.log;
    process.stdout.isTTY = saved.tty;
    for (const [key, value] of [['LEXIS_TWO_REGISTRY_URL', saved.registry], ['CI', saved.ci], ['LEXIS_TWO_NO_UPDATE_CHECK', saved.optOut]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    await registry.close();
  }
  return { lines, requests: registry.requests.length };
}

test('the automatic check prints one line for a newer version and nothing otherwise', async () => {
  const newer = await runNotify(['status'], { latest: '99.0.0' });
  assert.equal(newer.requests, 1);
  assert.equal(newer.lines.length, 1);
  assert.match(newer.lines[0], /lexis-two 99\.0\.0 is available \(you have /);
  assert.ok(newer.lines[0].includes(pkg.version));

  const same = await runNotify(['status'], { latest: pkg.version });
  assert.equal(same.requests, 1);
  assert.deepEqual(same.lines, []);
});

test('the automatic check is not attempted when a skip condition holds', async () => {
  const cases = [
    { args: ['status'], env: { CI: '1' } },
    { args: ['status'], env: { LEXIS_TWO_NO_UPDATE_CHECK: '1' } },
    { args: ['status', '--no-update-check'], env: {} },
    { args: ['install', '--dry-run'], env: {} },
    { args: ['install', '--uninstall'], env: {} },
  ];
  for (const { args, env } of cases) {
    const result = await runNotify(args, { latest: '99.0.0', env });
    assert.equal(result.requests, 0, args.join(' ') + JSON.stringify(env));
    assert.deepEqual(result.lines, []);
  }
});

test('status --check reports the three outcomes', async () => {
  const newer = await runNotify(['status', '--check'], { latest: '99.0.0', force: true, env: { CI: '1' } });
  assert.match(newer.lines[0], /is available/);

  const same = await runNotify(['status', '--check'], { latest: pkg.version, force: true });
  assert.deepEqual(same.lines, [`lexis-two ${pkg.version} is up to date`]);

  const saved = process.env.LEXIS_TWO_REGISTRY_URL;
  const logs = [];
  const log = console.log;
  try {
    process.env.LEXIS_TWO_REGISTRY_URL = 'http://127.0.0.1:1/latest';
    console.log = (line) => logs.push(String(line));
    await notifyUpdate(parseArgs(['status', '--check']), { force: true });
  } finally {
    console.log = log;
    if (saved === undefined) delete process.env.LEXIS_TWO_REGISTRY_URL; else process.env.LEXIS_TWO_REGISTRY_URL = saved;
  }
  assert.deepEqual(logs, ['could not check for updates']);
});

test('status --check exits 0 even when the check fails', () => {
  const { project, home } = scratch();
  const result = cli(['status', '--check', '--project-dir', project], {
    home,
    extraEnv: { LEXIS_TWO_REGISTRY_URL: 'http://127.0.0.1:1/latest' },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /could not check for updates/);
});
