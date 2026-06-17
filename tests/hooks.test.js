#!/usr/bin/env node

const test = require('node:test');
const assert = require('node:assert/strict');
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

test('hooks integration tests', async (t) => {
  let originalEnv;
  let temp;
  let home;
  let pluginData;
  let codexEnv;
  let codexState;

  t.beforeEach(() => {
    // Save original env and clean it
    originalEnv = { ...process.env };
    delete process.env.CLAUDE_CONFIG_DIR;
    delete process.env.LEXIS_TWO_DEFAULT_MODE;

    temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexis-two-hooks-'));
    home = path.join(temp, 'home');
    pluginData = path.join(temp, 'plugin-data');
    fs.mkdirSync(home, { recursive: true });

    codexEnv = {
      HOME: home,
      USERPROFILE: home,
      PLUGIN_DATA: pluginData,
      LEXIS_TWO_DEFAULT_MODE: 'ultra',
    };
    codexState = path.join(pluginData, '.lexis-two-active');
  });

  t.afterEach(() => {
    // Restore original env and clean temp folder
    process.env = originalEnv;
    try {
      fs.rmSync(temp, { recursive: true, force: true });
    } catch (e) {}
  });

  await t.test('lexis-two-activate.js activates ultra mode for Codex', () => {
    const result = run('lexis-two-activate.js', codexEnv);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(fs.readFileSync(codexState, 'utf8'), 'ultra');
    const output = JSON.parse(result.stdout);
    assert.equal(output.systemMessage, 'LEXIS-TWO:ULTRA');
    assert.match(
      output.hookSpecificOutput.additionalContext,
      /LEXIS-TWO MODE ACTIVE — level: ultra/,
    );
  });

  await t.test('lexis-two-mode-tracker.js switches mode to lite', () => {
    // First activate
    run('lexis-two-activate.js', codexEnv);

    let result = run(
      'lexis-two-mode-tracker.js',
      codexEnv,
      JSON.stringify({ prompt: '@lexis-two lite' }),
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(fs.readFileSync(codexState, 'utf8'), 'lite');
    let output = JSON.parse(result.stdout);
    assert.equal(output.systemMessage, 'LEXIS-TWO:LITE');

    // Test the new unifed /lexis command
    result = run(
      'lexis-two-mode-tracker.js',
      codexEnv,
      JSON.stringify({ prompt: '/lexis ultra' }),
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(fs.readFileSync(codexState, 'utf8'), 'ultra');
    output = JSON.parse(result.stdout);
    assert.equal(output.systemMessage, 'LEXIS-TWO:ULTRA');

    // Test the review subcommand
    result = run(
      'lexis-two-mode-tracker.js',
      codexEnv,
      JSON.stringify({ prompt: '/lexis review' }),
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(fs.readFileSync(codexState, 'utf8'), 'review');
    output = JSON.parse(result.stdout);
    assert.equal(output.systemMessage, 'LEXIS-TWO:REVIEW');
  });

  await t.test('lexis-two-mode-tracker.js deactivates mode with normal prompt', () => {
    // First activate
    run('lexis-two-activate.js', codexEnv);

    const result = run(
      'lexis-two-mode-tracker.js',
      codexEnv,
      JSON.stringify({ prompt: 'normal mode' }),
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(fs.existsSync(codexState), false);
    const output = JSON.parse(result.stdout);
    assert.equal(output.systemMessage, 'LEXIS-TWO:OFF');
  });

  await t.test('lexis-two-activate.js activates full mode for Claude', () => {
    const claudeEnv = {
      HOME: home,
      USERPROFILE: home,
      LEXIS_TWO_DEFAULT_MODE: 'full',
    };

    const result = run('lexis-two-activate.js', claudeEnv);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(
      fs.readFileSync(path.join(home, '.claude', '.lexis-two-active'), 'utf8'),
      'full',
    );
  });

  await t.test('CLAUDE_CONFIG_DIR overrides ~/.claude for Claude flag file', () => {
    const home2 = path.join(temp, 'home2');
    fs.mkdirSync(home2, { recursive: true });
    const customConfigDir = path.join(temp, 'custom-claude');

    const result = run('lexis-two-activate.js', {
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
  });

  await t.test('copilot hooks isolate state from Codex', () => {
    const copilotData = path.join(temp, 'copilot-data');
    const codexData = path.join(temp, 'codex-data-shadow');

    let result = run('lexis-two-activate.js', {
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
    let output = JSON.parse(result.stdout);
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
  });
});
