// Ponytail arm (legacy label) — reads Lexis-Two skill until promptfoo config is renamed.
const { system } = require('./lexis-two');
module.exports = ({ vars }) => [
  { role: 'system', content: system },
  { role: 'user', content: vars.task },
];
