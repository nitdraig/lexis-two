#!/usr/bin/env node
// Every lexis-two command the pi extension registers must also ship as a
// file-based command for the hosts that need one: Claude Code (commands/*.toml,
// which Gemini CLI reuses) and OpenCode (.opencode/commands/*.md). /lexis-two-help
// was advertised in the README and the help card but missing both files; this
// guards that drift -- a registered command with no adapter file fails here.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const piSource = fs.readFileSync(path.join(root, 'pi-extension', 'index.js'), 'utf8');
// Literal registerCommand("name") plus DEPRECATED_LEXIS_SKILL_COMMANDS { command: "..." } entries
const literalCommands = [...piSource.matchAll(/registerCommand\(["']([\w-]+)["']/g)].map((m) => m[1]);
const deprecatedCommands = [...piSource.matchAll(/command: "(lexis-two-[^"]+)"/g)].map((m) => m[1]);
const commands = [...new Set([...literalCommands, ...deprecatedCommands])];

test('pi registers at least the base command', () => {
  assert.ok(commands.includes('lexis-two'), 'expected pi to register a lexis-two command');
});

test('every registered command ships a Claude commands/*.toml', () => {
  for (const command of commands) {
    const tomlPath = path.join(root, 'commands', `${command}.toml`);
    assert.ok(
      fs.existsSync(tomlPath),
      `missing Claude command adapter: commands/${command}.toml (registered in pi-extension/index.js)`
    );
  }
});

test('every registered command ships an OpenCode .opencode/commands/*.md', () => {
  for (const command of commands) {
    const mdPath = path.join(root, '.opencode', 'commands', `${command}.md`);
    assert.ok(
      fs.existsSync(mdPath),
      `missing OpenCode command adapter: .opencode/commands/${command}.md (registered in pi-extension/index.js)`
    );
  }
});
