// lexis-two — OpenCode plugin.
//
// Injects the lexis-two ruleset into every chat's system prompt at the active
// intensity, and persists /lexis-two mode switches. Reuses the shared instruction
// builder so Claude Code, Codex, pi, and OpenCode all read one source of truth.
//
// OpenCode loads this as a server plugin — add it to your opencode.json:
//   { "plugin": ["./.opencode/plugins/lexis-two.mjs"] }

import { createRequire } from "module";
import fs from "fs";
import os from "os";
import path from "path";

// The shared instruction builder is CommonJS; bridge to it from this ES module.
const require = createRequire(import.meta.url);

let lexisInstructionsModule;
try {
  lexisInstructionsModule = require("../../hooks/lexis-two-instructions");
} catch (e) {
  try {
    lexisInstructionsModule = require("@draig/lexis-two/hooks/lexis-two-instructions");
  } catch (err) {
    throw new Error("Failed to load lexis-two-instructions: " + err.message);
  }
}

const {
  getLexisInstructions,
  getDefaultMode,
  normalizePersistedMode,
} = lexisInstructionsModule;

// OpenCode has no flag-file convention of its own; keep mode beside its config.
const statePath = path.join(
  process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config"),
  "opencode",
  ".lexis-two-active",
);

function readMode() {
  try {
    return (
      normalizePersistedMode(fs.readFileSync(statePath, "utf8").trim()) ||
      getDefaultMode()
    );
  } catch (e) {
    return getDefaultMode();
  }
}

function writeMode(mode) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, mode);
}

export default async ({ client } = {}) => {
  const log = (level, message) => {
    try {
      client &&
        client.app &&
        client.app.log({ body: { service: "lexis-two", level, message } });
    } catch (e) {}
  };

  return {
    // Append the ruleset to the system prompt every turn.
    "experimental.chat.system.transform": async (_input, output) => {
      const mode = readMode();
      if (mode === "off") return;
      output.system.push(getLexisInstructions(mode));
    },

    // Persist `/lexis-two <level>` so the next turn's injection follows it.
    "command.execute.before": async (input) => {
      if (!input || input.command !== "lexis-two") return;
      // `off` is persisted like any mode; the transform reads it and stays silent.
      const mode =
        normalizePersistedMode((input.arguments || "").trim()) ||
        getDefaultMode();
      writeMode(mode);
      log("info", "lexis-two " + mode);
    },
  };
};
