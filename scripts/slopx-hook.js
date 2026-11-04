#!/usr/bin/env node
// slopx PostToolUse hook (Claude Code). Opt-in: it does nothing unless it is enabled.
//
// After the agent edits one file, it runs the `immediate` tier of the slopx rules on that file and
// returns what it found as context for the agent. It never blocks and always exits 0.
//
// Enable with SLOPX_HOOK=1 or { "hook": { "enabled": true } } in .slopx.json.
// SLOPX_HOOK_DISABLED=1 wins over both. See docs/slopx.md for the settings snippet.

const fs = require('fs');
const os = require('os');
const path = require('path');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

// Cheap check that avoids loading the detector when the hook is off.
function enabledIn(cwd) {
  if (process.env.SLOPX_HOOK_DISABLED === '1') return false;
  if (process.env.SLOPX_HOOK === '1') return true;
  let enabled = false;
  for (const name of ['.slopx.json', '.slopx.local.json']) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(cwd, name), 'utf8'));
      if (data && data.hook && typeof data.hook.enabled === 'boolean') enabled = data.hook.enabled;
    } catch {
      // missing or invalid config: the audit itself reports that, the hook just stays quiet
    }
  }
  return enabled;
}

function statePath(sessionId) {
  const safe = String(sessionId || 'default').replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 80);
  return path.join(os.tmpdir(), `slopx-hook-${safe}.json`);
}

function loadReported(file) {
  try {
    return new Set(JSON.parse(fs.readFileSync(file, 'utf8')));
  } catch {
    return new Set();
  }
}

// Key by rule, file and the n-th occurrence of that rule in the file, so a finding that moves
// to another line after later edits is not reported again.
function keysFor(findings) {
  const counts = new Map();
  return findings.map((f) => {
    const base = `${f.id}|${f.file}`;
    const n = (counts.get(base) || 0) + 1;
    counts.set(base, n);
    return `${base}|${n}`;
  });
}

function run() {
  let payload;
  try {
    payload = JSON.parse(readStdin().replace(/^﻿/, ''));
  } catch {
    return;
  }
  const cwd = path.resolve(payload.cwd || process.cwd());
  if (!enabledIn(cwd)) return;

  const target = payload.tool_input && (payload.tool_input.file_path || payload.tool_input.path);
  if (typeof target !== 'string' || !target) return;
  const rel = path.relative(cwd, path.resolve(cwd, target)).split(path.sep).join('/');
  if (rel === '' || rel.startsWith('..') || path.isAbsolute(rel)) return;

  const { runSlopxAudit } = require('./slopx-audit');
  let result;
  try {
    result = runSlopxAudit({ cwd, only: [rel], tier: 'immediate' });
  } catch {
    try {
      result = runSlopxAudit({ cwd, only: [rel], tier: 'immediate', all: true }); // not a git repository
    } catch {
      return;
    }
  }
  if (result.findings.length === 0) return;

  const stateFile = statePath(payload.session_id);
  const reported = loadReported(stateFile);
  const keys = keysFor(result.findings);
  const fresh = result.findings.filter((_, i) => !reported.has(keys[i]));
  if (fresh.length === 0) return;
  keys.forEach((k) => reported.add(k));
  try {
    fs.writeFileSync(stateFile, JSON.stringify([...reported]));
  } catch {
    // dedupe is best effort
  }

  // Factual wording on purpose: the text is read as a system reminder, not as an instruction.
  const lines = fresh.map(
    (f) => `- ${f.file}:${f.line} ${f.id} (${f.severity}): ${f.description}. Suggestion on record: ${f.suggestion}.`,
  );
  const additionalContext =
    `slopx checked ${rel} after the edit and found ${fresh.length} item${fresh.length === 1 ? '' : 's'}:\n${lines.join('\n')}\n` +
    'An intentional choice can be recorded with a "slopx-disable-line <rule>: <reason>" comment.';
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext } }));
}

try {
  run();
} catch {
  // a hook must never break the session
}
process.exit(0);
