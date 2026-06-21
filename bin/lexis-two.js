#!/usr/bin/env node
// lexis: thin bin shim — npm links this file; keeps install.js testable as a module
const { spawnSync } = require('child_process');
const path = require('path');

const installScript = path.join(__dirname, '..', 'scripts', 'install.js');
const result = spawnSync(process.execPath, [installScript, ...process.argv.slice(2)], {
  stdio: 'inherit',
});

if (result.error) {
  console.error(`lexis-two failed: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
