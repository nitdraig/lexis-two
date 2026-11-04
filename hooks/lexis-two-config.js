// lexis-two — shared configuration resolver
//
// Resolution order for default mode:
//   1. LEXIS_TWO_DEFAULT_MODE environment variable
//   2. Config file defaultMode field:
//      - $XDG_CONFIG_HOME/lexis-two/config.json (any platform, if set)
//      - ~/.config/lexis-two/config.json (macOS / Linux fallback)
//      - %APPDATA%\lexis-two\config.json (Windows fallback)
//   3. 'full'
//
// Resolution order for reply language (optional; unset = the user's own language):
//   1. LEXIS_TWO_LANGUAGE environment variable
//   2. Config file language field

const fs = require('fs');
const path = require('path');
const os = require('os');

const DEFAULT_MODE = 'full';
const VALID_MODES = ['off', 'lite', 'full', 'ultra', 'review'];
const RUNTIME_MODES = ['off', 'lite', 'full', 'ultra'];

function normalizeMode(mode) {
  if (typeof mode !== 'string') return null;
  const normalized = mode.trim().toLowerCase();
  return RUNTIME_MODES.includes(normalized) ? normalized : null;
}

function normalizeConfigMode(mode) {
  if (typeof mode !== 'string') return null;
  const normalized = mode.trim().toLowerCase();
  return VALID_MODES.includes(normalized) ? normalized : null;
}

function getConfigDir() {
  if (process.env.XDG_CONFIG_HOME) {
    return path.join(process.env.XDG_CONFIG_HOME, 'lexis-two');
  }
  if (process.platform === 'win32') {
    return path.join(
      process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
      'lexis-two'
    );
  }
  return path.join(os.homedir(), '.config', 'lexis-two');
}

function getConfigPath() {
  return path.join(getConfigDir(), 'config.json');
}

function getClaudeDir() {
  // lexis-two: CLAUDE_CONFIG_DIR overrides ~/.claude, matching Claude Code.
  return process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
}

// Returns the parsed config object, or {} when the file is missing or invalid.
function readConfig() {
  try {
    const config = JSON.parse(fs.readFileSync(getConfigPath(), 'utf8'));
    return config && typeof config === 'object' && !Array.isArray(config) ? config : {};
  } catch (e) {
    return {};
  }
}

function getDefaultMode() {
  // 1. Environment variable (highest priority)
  // 2. Config file, 3. Default
  return (
    normalizeConfigMode(process.env.LEXIS_TWO_DEFAULT_MODE) ||
    normalizeConfigMode(readConfig().defaultMode) ||
    DEFAULT_MODE
  );
}

// lexis: the value is injected into the model prompt, so only a short plain
// language name is accepted (letters, spaces, hyphens) — no free-form text.
function normalizeLanguage(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return /^\p{L}[\p{L} -]{0,39}$/u.test(normalized) ? normalized : null;
}

// Preferred reply language, or null to follow the user's own language.
// Resolution: LEXIS_TWO_LANGUAGE env, then config file `language`. Invalid values are ignored.
function getLanguage() {
  return normalizeLanguage(process.env.LEXIS_TWO_LANGUAGE) || normalizeLanguage(readConfig().language);
}

function writeDefaultMode(mode) {
  const normalized = normalizeConfigMode(mode);
  if (!normalized) return null;

  const configPath = getConfigPath();
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  // Keep other keys (e.g. `language`) when updating the mode.
  fs.writeFileSync(configPath, JSON.stringify({ ...readConfig(), defaultMode: normalized }, null, 2), 'utf8');
  return normalized;
}

module.exports = {
  DEFAULT_MODE,
  VALID_MODES,
  RUNTIME_MODES,
  getDefaultMode,
  getLanguage,
  normalizeLanguage,
  getConfigDir,
  getConfigPath,
  getClaudeDir,
  normalizeMode,
  normalizeConfigMode,
  writeDefaultMode,
};
