#!/usr/bin/env node
// Smoke test for the OpenCode adapter: the plugin's hooks behave against the
// real (structural) OpenCode hook shapes. No live OpenCode needed.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

// Point the plugin's mode-flag at a temp config home BEFORE it loads — the
// plugin resolves its state path from the environment on every call, so these
// variables only need to be set before the hooks run.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-two-opencode-'));
process.env.XDG_CONFIG_HOME = tmp;
delete process.env.LEXIS_TWO_DEFAULT_MODE;
delete process.env.OPENCODE_CONFIG_DIR;
const statePath = path.join(tmp, 'opencode', '.lexis-two-active');

let loadServer;
test.before(async () => {
  const url = pathToFileURL(path.join(__dirname, '..', '.opencode', 'plugins', 'lexis-two.mjs'));
  const mod = await import(url);
  loadServer = mod.default.server;
});

function transform(hooks) {
  const output = { system: [] };
  return hooks['experimental.chat.system.transform']({ model: {} }, output).then(() => output.system);
}

test('system.transform injects the ruleset at the default mode (full)', async () => {
  try { fs.unlinkSync(statePath); } catch (e) {}
  const hooks = await loadServer({});
  const system = await transform(hooks);
  assert.equal(system.length, 1);
  assert.match(system[0], /LEXIS-TWO MODE ACTIVE — level: full/);
  assert.match(system[0], /lazy senior developer/);
});

test('/lexis ultra persists mode, transform follows it', async () => {
  const hooks = await loadServer({});
  await hooks['command.execute.before']({ command: 'lexis', arguments: 'ultra', sessionID: 's' });
  assert.equal(fs.readFileSync(statePath, 'utf8'), 'ultra');
  const system = await transform(hooks);
  assert.match(system[0], /LEXIS-TWO MODE ACTIVE — level: ultra/);
});

test('command.execute.before persists /lexis-two ultra, transform follows it', async () => {
  const hooks = await loadServer({});
  await hooks['command.execute.before']({ command: 'lexis-two', arguments: 'ultra', sessionID: 's' });
  assert.equal(fs.readFileSync(statePath, 'utf8'), 'ultra');
  const system = await transform(hooks);
  assert.match(system[0], /LEXIS-TWO MODE ACTIVE — level: ultra/);
});

test('/lexis-two off persists off and transform injects nothing', async () => {
  const hooks = await loadServer({});
  await hooks['command.execute.before']({ command: 'lexis-two', arguments: 'off', sessionID: 's' });
  assert.equal(fs.readFileSync(statePath, 'utf8'), 'off');
  const system = await transform(hooks);
  assert.deepEqual(system, []);
});

test('unrelated commands do not touch the flag', async () => {
  try { fs.unlinkSync(statePath); } catch (e) {}
  const hooks = await loadServer({});
  await hooks['command.execute.before']({ command: 'commit', arguments: 'x', sessionID: 's' });
  assert.equal(fs.existsSync(statePath), false);
});

test('/lexis review and other subcommands never write the flag', async () => {
  try { fs.unlinkSync(statePath); } catch (e) {}
  const hooks = await loadServer({});
  for (const args of ['review', 'r', 'plan add a cache', 'status', 'help', 'default ultra', 'sssultra', '']) {
    await hooks['command.execute.before']({ command: 'lexis', arguments: args, sessionID: 's' });
    assert.equal(fs.existsSync(statePath), false, args);
  }
});

test('the first word decides the level: "/lexis lite for this task" persists lite', async () => {
  const hooks = await loadServer({});
  await hooks['command.execute.before']({ command: 'lexis', arguments: 'lite for this task', sessionID: 's' });
  assert.equal(fs.readFileSync(statePath, 'utf8'), 'lite');
  fs.unlinkSync(statePath);
});

test('a stale review flag falls back to the default mode', async () => {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, 'review');
  const hooks = await loadServer({});
  const system = await transform(hooks);
  assert.match(system[0], /LEXIS-TWO MODE ACTIVE — level: full/);
  fs.unlinkSync(statePath);
});

test('OPENCODE_CONFIG_DIR decides where the flag lives', async () => {
  const custom = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-two-opencode-cfg-'));
  process.env.OPENCODE_CONFIG_DIR = custom;
  try {
    const hooks = await loadServer({});
    await hooks['command.execute.before']({ command: 'lexis', arguments: 'lite', sessionID: 's' });
    assert.equal(fs.readFileSync(path.join(custom, '.lexis-two-active'), 'utf8'), 'lite');
    assert.match((await transform(hooks))[0], /level: lite/);
  } finally {
    delete process.env.OPENCODE_CONFIG_DIR;
    fs.rmSync(custom, { recursive: true, force: true });
  }
});

test('local models get the compact ruleset, logged once per model', async () => {
  const logs = [];
  const client = { app: { log: ({ body }) => logs.push(body) } };
  const hooks = await loadServer({ client });
  const run = async (model) => {
    const output = { system: [] };
    await hooks['experimental.chat.system.transform']({ model }, output);
    return output.system;
  };

  const [compact] = await run({ id: 'ollama/llama3' });
  assert.ok(compact.startsWith('[LEXIS-TWO: '), compact.slice(0, 40));
  assert.match(compact, /Never lazy about/);
  await run({ id: 'ollama/llama3' });
  await run({ id: 'lmstudio/qwen' });
  const [full] = await run({ id: 'anthropic/claude' });
  assert.match(full, /^LEXIS-TWO MODE ACTIVE/);

  const noted = logs.filter((l) => /compact ruleset to local model/.test(l.message));
  assert.equal(noted.length, 2, 'one log line per local model, not per turn');
  assert.ok(noted[0].message.includes('ollama/llama3'));
});

test('LEXIS_TWO_LOCAL_FULL=1 sends the full skill to a local model; other values do not', async () => {
  const hooks = await loadServer({});
  const run = async () => {
    const output = { system: [] };
    await hooks['experimental.chat.system.transform']({ model: { id: 'ollama/llama3' } }, output);
    return output.system[0];
  };
  try {
    process.env.LEXIS_TWO_LOCAL_FULL = '1';
    assert.match(await run(), /^LEXIS-TWO MODE ACTIVE/);
    process.env.LEXIS_TWO_LOCAL_FULL = 'true';
    assert.ok((await run()).startsWith('[LEXIS-TWO: '));
  } finally {
    delete process.env.LEXIS_TWO_LOCAL_FULL;
  }
});

test.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
