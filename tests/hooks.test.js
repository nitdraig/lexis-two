#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');

function run(script, env, input = '') {
  return spawnSync(process.execPath, [path.join(root, 'hooks', script)], {
    env: { ...process.env, ...env },
    input,
    encoding: 'utf8',
  });
}

// Keep the base env clean so the default-dir checks are deterministic; the
// CLAUDE_CONFIG_DIR case sets it explicitly.
delete process.env.CLAUDE_CONFIG_DIR;

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-two-hooks-'));
const home = path.join(temp, 'home');
const pluginData = path.join(temp, 'plugin-data');
fs.mkdirSync(home, { recursive: true });

// USERPROFILE alongside HOME: os.homedir() reads USERPROFILE on Windows, HOME on POSIX.
const codexEnv = {
  HOME: home,
  USERPROFILE: home,
  PLUGIN_DATA: pluginData,
  LEXIS_TWO_DEFAULT_MODE: 'ultra',
};
const codexState = path.join(pluginData, '.lexis-two-active');

let result = run('lexis-two-activate.js', codexEnv);
assert.equal(result.status, 0, result.stderr);
assert.equal(fs.readFileSync(codexState, 'utf8'), 'ultra');
let output = JSON.parse(result.stdout);
assert.equal(output.systemMessage, 'LEXIS-TWO:ULTRA');
assert.match(
  output.hookSpecificOutput.additionalContext,
  /LEXIS-TWO MODE ACTIVE — level: ultra/,
);

result = run(
  'lexis-two-mode-tracker.js',
  codexEnv,
  JSON.stringify({ prompt: '@lexis-two lite' }),
);
assert.equal(result.status, 0, result.stderr);
assert.equal(fs.readFileSync(codexState, 'utf8'), 'lite');
output = JSON.parse(result.stdout);
assert.equal(output.systemMessage, 'LEXIS-TWO:LITE');

result = run(
  'lexis-two-mode-tracker.js',
  codexEnv,
  JSON.stringify({ prompt: 'normal mode' }),
);
assert.equal(result.status, 0, result.stderr);
assert.equal(fs.existsSync(codexState), false);
output = JSON.parse(result.stdout);
assert.equal(output.systemMessage, 'LEXIS-TWO:OFF');

const claudeEnv = {
  HOME: home,
  USERPROFILE: home,
  LEXIS_TWO_DEFAULT_MODE: 'full',
};
delete claudeEnv.PLUGIN_DATA;

result = run('lexis-two-activate.js', claudeEnv);
assert.equal(result.status, 0, result.stderr);
assert.equal(
  fs.readFileSync(path.join(home, '.claude', '.lexis-two-active'), 'utf8'),
  'full',
);

// CLAUDE_CONFIG_DIR overrides ~/.claude for the flag file.
const home2 = path.join(temp, 'home2');
fs.mkdirSync(home2, { recursive: true });
const customConfigDir = path.join(temp, 'custom-claude');
result = run('lexis-two-activate.js', {
  HOME: home2,
  USERPROFILE: home2,
  CLAUDE_CONFIG_DIR: customConfigDir,
  LEXIS_TWO_DEFAULT_MODE: 'lite',
});
assert.equal(result.status, 0, result.stderr);
assert.equal(
  fs.readFileSync(path.join(customConfigDir, '.lexis-two-active'), 'utf8'),
  'lite',
);
assert.equal(
  fs.existsSync(path.join(home2, '.claude', '.lexis-two-active')),
  false,
  'flag must not land in ~/.claude when CLAUDE_CONFIG_DIR is set',
);

const copilotData = path.join(temp, 'copilot-data');
const codexData = path.join(temp, 'codex-data-shadow');
result = run('lexis-two-activate.js', {
  HOME: home,
  USERPROFILE: home,
  COPILOT_PLUGIN_DATA: copilotData,
  PLUGIN_DATA: codexData,
  LEXIS_TWO_DEFAULT_MODE: 'full',
});
assert.equal(result.status, 0, result.stderr);
assert.equal(fs.readFileSync(path.join(copilotData, '.lexis-two-active'), 'utf8'), 'full');
assert.equal(
  fs.existsSync(path.join(codexData, '.lexis-two-active')),
  false,
  'copilot hooks must not write mode state to codex PLUGIN_DATA',
);
output = JSON.parse(result.stdout);
assert.match(output.additionalContext, /LEXIS-TWO MODE ACTIVE — level: full/);

result = run(
  'lexis-two-mode-tracker.js',
  {
    HOME: home,
    USERPROFILE: home,
    COPILOT_PLUGIN_DATA: copilotData,
    PLUGIN_DATA: codexData,
  },
  JSON.stringify({ prompt: '/lexis-two ultra' }),
);
assert.equal(result.status, 0, result.stderr);
assert.equal(fs.readFileSync(path.join(copilotData, '.lexis-two-active'), 'utf8'), 'ultra');
assert.equal(
  fs.existsSync(path.join(codexData, '.lexis-two-active')),
  false,
  'copilot mode tracker must keep codex PLUGIN_DATA untouched',
);
output = JSON.parse(result.stdout);
assert.deepEqual(output, {});

fs.rmSync(temp, { recursive: true, force: true });
console.log('hook compatibility checks passed');
