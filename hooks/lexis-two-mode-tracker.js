#!/usr/bin/env node
// lexis-two — UserPromptSubmit hook to track which lexis-two mode is active
// Inspects user input for /lexis-two commands and writes mode to flag file

const { getDefaultMode } = require('./lexis-two-config');
const { clearMode, setMode, writeHookOutput } = require('./lexis-two-runtime');

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    // Strip UTF-8 BOM some shells prepend when piping (breaks JSON.parse)
    const data = JSON.parse(input.replace(/^\uFEFF/, ''));
    const prompt = (data.prompt || '').trim().toLowerCase();

    // Match /lexis-two, /lexis, or /specxis commands
    if (/^[/@$](lexis-two|lexis|specxis)/.test(prompt)) {
      const parts = prompt.split(/\s+/);
      const cmd = parts[0].replace(/^[@$]/, '/');
      const arg = parts[1] || '';

      let mode = null;

      if (
        cmd === '/lexis-two-review' ||
        cmd === '/lexis-two:lexis-two-review' ||
        cmd === '/lexis:review' ||
        cmd === '/lexis:r'
      ) {
        mode = 'review';
      } else if (
        cmd === '/lexis-two' ||
        cmd === '/lexis-two:lexis-two' ||
        cmd === '/lexis' ||
        cmd === '/lexis:lexis'
      ) {
        if (arg === 'lite') mode = 'lite';
        else if (arg === 'full') mode = 'full';
        else if (arg === 'ultra') mode = 'ultra';
        else if (arg === 'off') mode = 'off';
        else if (arg === 'review' || arg === 'r') mode = 'review';
        else mode = getDefaultMode();
      }

      if (mode && mode !== 'off') {
        setMode(mode);
        writeHookOutput(
          'UserPromptSubmit',
          mode,
          'LEXIS-TWO MODE CHANGED — level: ' + mode,
        );
      } else if (mode === 'off') {
        clearMode();
        writeHookOutput('UserPromptSubmit', 'off', 'LEXIS-TWO MODE OFF');
      }
    }

    // Detect deactivation
    if (/\b(stop lexis|normal mode)\b/i.test(prompt)) {
      clearMode();
      writeHookOutput('UserPromptSubmit', 'off', 'LEXIS-TWO MODE OFF');
    }
  } catch (e) {
    // Silent fail
  }
});
