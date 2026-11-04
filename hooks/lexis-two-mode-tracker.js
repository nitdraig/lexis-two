#!/usr/bin/env node
// lexis-two — UserPromptSubmit hook to track which lexis-two mode is active
// Writes the flag file only for an explicit intensity: /lexis <lite|full|ultra|off>.
// Every other /lexis form (bare, status, plan, review, help, ...) leaves the flag alone.

const { getLexisInstructions } = require('./lexis-two-instructions');
const { clearMode, setMode, writeHookOutput } = require('./lexis-two-runtime');

const INTENSITIES = new Set(['lite', 'full', 'ultra', 'off']);
// Only the whole prompt counts: a sentence that merely mentions the phrase must not switch Lexis off.
const DEACTIVATE = /^(stop lexis|normal mode)[.!]?$/;

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    // Strip UTF-8 BOM some shells prepend when piping (breaks JSON.parse)
    const data = JSON.parse(input.replace(/^﻿/, ''));
    const prompt = (data.prompt || '').trim().toLowerCase();

    // Match /lexis-two, /lexis and their plugin-namespaced forms. The /lexis-two-review style
    // skill commands and every subcommand fall through: they never change the intensity.
    if (/^[/@$](lexis-two|lexis)(?::|\s|$)/.test(prompt)) {
      const parts = prompt.split(/\s+/);
      const arg = parts[1] || '';
      const mode = INTENSITIES.has(arg) ? arg : null;

      if (mode && mode !== 'off') {
        setMode(mode);
        writeHookOutput(
          'UserPromptSubmit',
          mode,
          'LEXIS-TWO MODE CHANGED — level: ' + mode + '\n\n' + getLexisInstructions(mode),
        );
      } else if (mode === 'off') {
        clearMode();
        writeHookOutput('UserPromptSubmit', 'off', 'LEXIS-TWO MODE OFF');
      }
    } else if (DEACTIVATE.test(prompt)) {
      clearMode();
      writeHookOutput('UserPromptSubmit', 'off', 'LEXIS-TWO MODE OFF');
    }
  } catch (e) {
    // Silent fail
  }
});
