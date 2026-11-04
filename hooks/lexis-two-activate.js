#!/usr/bin/env node
// lexis-two — Claude Code SessionStart activation hook
//
// Runs on every session start:
//   1. Writes flag file at ~/.claude/.lexis-two-active (statusline reads this)
//   2. Emits lexis-two ruleset as hidden SessionStart context
//   3. Detects missing statusline config and emits setup nudge
//
// On `resume` and `compact` the mode the user already chose is kept; `startup`
// and `clear` (and hosts that send no source) apply the default mode.

const fs = require('fs');
const path = require('path');
const { getDefaultMode, getClaudeDir } = require('./lexis-two-config');
const { getLexisInstructions } = require('./lexis-two-instructions');
const {
  clearMode,
  isCodex,
  isCopilot,
  readMode,
  setMode,
  writeHookOutput,
} = require('./lexis-two-runtime');

const KEEP_MODE_SOURCES = new Set(['resume', 'compact']);
const STDIN_WAIT_MS = 300;

// Reads `source` from the hook payload without ever blocking: no TTY wait, no payload,
// or a host that keeps stdin open all resolve to '' after a short timeout.
function readSource(callback) {
  if (process.stdin.isTTY) return callback('');
  let input = '';
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    process.stdin.destroy(); // lets the process exit even if the host never closes stdin
    let source = '';
    try {
      source = String(JSON.parse(input.replace(/^﻿/, '')).source || '');
    } catch (e) {
      // no payload or not JSON: treat as a fresh start
    }
    callback(source);
  };
  const timer = setTimeout(finish, STDIN_WAIT_MS);
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { input += chunk; });
  process.stdin.on('end', finish);
  process.stdin.on('error', finish);
}

function activate(source) {
  const claudeDir = getClaudeDir();
  const settingsPath = path.join(claudeDir, 'settings.json');

  const kept = KEEP_MODE_SOURCES.has(source) ? readMode() : null;
  const mode = kept || getDefaultMode();

  // "off" mode — skip activation entirely, don't write flag or emit rules
  if (mode === 'off') {
    clearMode();
    writeHookOutput('SessionStart', 'off', isCodex ? '' : 'OK');
    return;
  }

  // 1. Write flag file
  try {
    setMode(mode);
  } catch (e) {
    // Silent fail -- flag is best-effort, don't block the hook
  }

  // 2. Emit the lexis-two ruleset, filtered to the active intensity level.
  let output = getLexisInstructions(mode);

  // 3. Detect missing statusline config — nudge Claude to help set it up.
  // Only Claude Code has this statusline; Codex and Copilot get no nudge.
  if (!isCodex && !isCopilot) try {
    let hasStatusline = false;
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      if (settings.statusLine) {
        hasStatusline = true;
      }
    }

    if (!hasStatusline) {
      const isWindows = process.platform === 'win32';
      const scriptName = isWindows ? 'lexis-two-statusline.ps1' : 'lexis-two-statusline.sh';
      const scriptPath = path.join(__dirname, scriptName);
      const command = isWindows
        ? `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`
        : `bash "${scriptPath}"`;
      const statusLineSnippet =
        '"statusLine": { "type": "command", "command": ' + JSON.stringify(command) + ' }';
      output += "\n\n" +
        "STATUSLINE SETUP NEEDED: The lexis-two plugin includes a statusline badge showing active mode " +
        "(e.g. [LEXIS-TWO], [LEXIS-TWO:ULTRA]). It is not configured yet. " +
        "To enable, add this to ~/.claude/settings.json: " +
        statusLineSnippet + " " +
        "Proactively offer to set this up for the user on first interaction.";
    }
  } catch (e) {
    // Silent fail — don't block session start over statusline detection
  }

  writeHookOutput('SessionStart', mode, output);
}

readSource(activate);
