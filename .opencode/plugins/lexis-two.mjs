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

// lexis: a fallback to "@draig/lexis-two/hooks/..." is not possible: package "exports" does not expose it
const lexisInstructionsModule = require("../../hooks/lexis-two-instructions");

const { getLexisInstructions, getDefaultMode, normalizeMode, isLocalModel } =
  lexisInstructionsModule;

// OpenCode has no flag-file convention of its own; keep mode beside its config.
// Same lookup order as the installer: OPENCODE_CONFIG_DIR, then XDG_CONFIG_HOME/opencode, then ~/.config/opencode.
function getStatePath() {
  const dir =
    process.env.OPENCODE_CONFIG_DIR ||
    path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config"), "opencode");
  return path.join(dir, ".lexis-two-active");
}

function readMode() {
  try {
    return (
      normalizeMode(fs.readFileSync(getStatePath(), "utf8").trim()) ||
      getDefaultMode()
    );
  } catch (e) {
    return getDefaultMode();
  }
}

function writeMode(mode) {
  const statePath = getStatePath();
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, mode);
}

function createServerHooks({ client } = {}) {
  const log = (level, message) => {
    try {
      client &&
        client.app &&
        client.app.log({ body: { service: "lexis-two", level, message } });
    } catch (e) {}
  };

  const notedModels = new Set();

  return {
    // Persist /lexis <mode> switches. Subcommands (plan, review, help, ...)
    // keep the current mode - only a valid intensity argument writes the flag.
    "command.execute.before": async (input) => {
      if (!input || (input.command !== "lexis" && input.command !== "lexis-two"))
        return;
      // lexis: first word only and runtime intensities only, so "/lexis review" or "/lexis plan x" never write the flag
      const mode = normalizeMode((input.arguments || "").trim().split(/\s+/)[0]);
      if (!mode) return;
      writeMode(mode);
      log("info", "lexis-two " + mode);
    },
    // Append the ruleset to the system prompt every turn.
    "experimental.chat.system.transform": async (_input, output) => {
      const mode = readMode();
      if (mode === "off") return;

      const model = _input?.model?.id || _input?.model || "";
      // Local models get the short per-level block to keep small contexts free;
      // LEXIS_TWO_LOCAL_FULL=1 sends them the full skill instead.
      const compact = isLocalModel(model) && process.env.LEXIS_TWO_LOCAL_FULL !== "1";
      if (compact && !notedModels.has(model)) {
        // Say so once per model: a silent change in behavior looks like Lexis is broken.
        notedModels.add(model);
        log("info", "lexis-two sending the compact ruleset to local model " + model + " (see docs/setup.md#opencode)");
      }

      output.system.push(getLexisInstructions(mode, { compact }));
    },
  };
}

// OpenCode v1 plugin shape: default export is { server(), tui() }.
export default {
  async server(input) {
    return createServerHooks(input);
  },
};
