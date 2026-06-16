// Lexis-Two arm: repo skill (full) as the system prompt.
const fs = require('fs');
const path = require('path');

const system = fs.readFileSync(
  path.join(__dirname, '..', '..', 'skills', 'lexis-two', 'SKILL.md'),
  'utf8',
);

module.exports = { system };
