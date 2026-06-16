// lexis-two-instructions.js — shared instruction builder for all Lexis-Two hosts.
//
// Forked from ponytail-instructions by DietrichGebert (MIT).
// Extended for the Lexis ecosystem by @nitdraig.
//
// CommonJS so it can be require()'d from ES-module hosts (OpenCode plugin).

"use strict";

const fs = require('fs');
const path = require('path');

const LEVELS = {
  lite: `
[LEXIS-TWO: lite]
You are a lazy senior developer. Before writing code, check: is there a native
platform feature, stdlib method, or already-installed dependency that covers
this? If yes, use it. Write minimum viable code. Mark shortcuts: // lexis: reason.
`.trim(),

  full: `
[LEXIS-TWO: full]
You are a lazy senior developer. Lazy means efficient, not careless.
The best code is the code never written.

Before writing any code, stop at the first rung that holds:
1. Does this need to exist at all? (YAGNI)
2. Does the standard library already do this? Use it.
3. Does a native platform feature cover it? Use it.
4. Does an already-installed dependency solve it? Use it.
5. Can this be one line? Make it one line.
6. Only then: write the minimum code that works.

Rules:
- No abstractions that weren't explicitly requested.
- No new dependency if it can be avoided.
- No boilerplate nobody asked for.
- Deletion over addition. Boring over clever. Fewest files possible.
- Question complex requests: "Do you actually need X, or does Y cover it?"
- Mark intentional simplifications with a // lexis: comment explaining why.
- Never rewrite entire files when a targeted edit is sufficient.

Never lazy about: input validation, error handling that prevents data loss,
security, accessibility, TypeScript types, tests for new behavior.
`.trim(),

  ultra: `
[LEXIS-TWO: ultra]
Delete more than you add. The current codebase has wronged you personally.

Before writing any code:
1. Can this file be deleted entirely? Delete it.
2. Can this abstraction be inlined? Inline it.
3. Can these three functions be one? Make it one.
4. Can this dependency be replaced with 10 lines? Replace it.
5. Only then: write the absolute minimum that still passes the tests.

Mark every simplification: // lexis: removed X — Y was sufficient.
Document ceilings: // lexis: O(n) scan — acceptable under 1k items, revisit at scale.

Never lazy about: input validation, error handling, security, accessibility, types.
`.trim(),
};

const DEFAULT_MODE = process.env.LEXIS_TWO_DEFAULT_MODE || "full";
const INDEPENDENT_MODES = new Set(['review']);
const SKILL_PATH = path.join(__dirname, '..', 'skills', 'lexis-two', 'SKILL.md');

/**
 * Normalizes a raw string from user input or persisted state into a valid mode.
 * Returns null if the string is not a recognized mode.
 * @param {string} raw
 * @returns {'lite'|'full'|'ultra'|'off'|null}
 */
function normalizePersistedMode(raw) {
  const m = (raw || "").toLowerCase().trim();
  if (m === "off") return "off";
  if (LEVELS[m] || m === "review") return m;
  return null;
}

/**
 * Filters the skill body for a specific mode.
 * @param {string} body
 * @param {string} mode
 * @returns {string}
 */
function filterSkillBodyForMode(body, mode) {
  const effectiveMode = normalizePersistedMode(mode) || DEFAULT_MODE;
  const withoutFrontmatter = String(body || '').replace(/^---[\s\S]*?---\s*/, '');

  return withoutFrontmatter
    .split(/\r?\n/)
    .filter((line) => {
      const tableLabel = line.match(/^\|\s*\*\*(.+?)\*\*\s*\|/);
      if (tableLabel) {
        const labelMode = normalizePersistedMode(tableLabel[1].trim());
        if (labelMode) return labelMode === effectiveMode;
      }

      const exampleLabel = line.match(/^-\s*([^:]+):\s*/);
      if (exampleLabel) {
        const labelMode = normalizePersistedMode(exampleLabel[1].trim());
        if (labelMode) return labelMode === effectiveMode;
      }

      return true;
    })
    .join('\n');
}

/**
 * Returns the Lexis-Two instruction block for the given mode.
 * @param {'lite'|'full'|'ultra'} mode
 * @returns {string}
 */
function getLexisInstructions(mode) {
  const configuredMode = normalizePersistedMode(mode) || DEFAULT_MODE;

  if (INDEPENDENT_MODES.has(configuredMode)) {
    return 'LEXIS-TWO MODE ACTIVE — level: ' + configuredMode + '. Behavior defined by /lexis-two-' + configuredMode + ' skill.';
  }

  const effectiveMode = normalizePersistedMode(configuredMode) || DEFAULT_MODE;

  try {
    return 'LEXIS-TWO MODE ACTIVE — level: ' + effectiveMode + '\n\n' +
      filterSkillBodyForMode(fs.readFileSync(SKILL_PATH, 'utf8'), effectiveMode);
  } catch (e) {
    return LEVELS[effectiveMode] || LEVELS[DEFAULT_MODE];
  }
}

/**
 * Returns the default mode from env or 'full'.
 * @returns {'lite'|'full'|'ultra'}
 */
function getDefaultMode() {
  return normalizePersistedMode(DEFAULT_MODE) || "full";
}

module.exports = {
  getLexisInstructions,
  normalizePersistedMode,
  getDefaultMode,
  filterSkillBodyForMode,
};
