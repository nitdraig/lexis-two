import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  DEFAULT_MODE,
  getDefaultMode,
  normalizeMode,
  normalizeConfigMode,
  normalizePersistedMode,
  writeDefaultMode,
} = require("../hooks/lexis-two-config.js");
const { getLexisInstructions, filterSkillBodyForMode } = require("../hooks/lexis-two-instructions.js");

export { filterSkillBodyForMode };
export const readDefaultMode = getDefaultMode;

export function resolveSessionMode(entries, fallbackMode = DEFAULT_MODE) {
  const fallback = normalizePersistedMode(fallbackMode) || DEFAULT_MODE;
  if (!Array.isArray(entries)) return fallback;

  for (let i = entries.length - 1; i >= 0; i -= 1) {
    const entry = entries[i];
    if (entry?.type !== "custom" || entry?.customType !== "lexis-two-mode") continue;

    const mode = normalizePersistedMode(entry?.data?.mode);
    if (mode) return mode;
  }

  return fallback;
}

export function parseLexisCommand(text, defaultMode = DEFAULT_MODE) {
  const fallback = normalizePersistedMode(defaultMode) || DEFAULT_MODE;
  const normalizedText = String(text || "").trim().toLowerCase();

  if (!normalizedText) {
    return { type: "set-mode", mode: fallback === "off" ? "full" : fallback };
  }

  const [primary, secondary] = normalizedText.split(/\s+/);

  if (primary === "status") return { type: "status" };

  if (primary === "default") {
    const mode = normalizeConfigMode(secondary);
    return mode ? { type: "set-default", mode } : { type: "invalid", reason: "invalid-default-mode" };
  }

  const mode = normalizeMode(primary);
  return mode ? { type: "set-mode", mode } : { type: "invalid", reason: "invalid-mode", mode: primary };
}

export { writeDefaultMode };

export default function lexisExtension(pi) {
  let currentMode = DEFAULT_MODE;
  let configuredDefaultMode = getDefaultMode();

  const setMode = (mode, ctx) => {
    const normalized = normalizePersistedMode(mode);
    if (!normalized) return;

    currentMode = normalized;
    pi.appendEntry("lexis-two-mode", { mode: normalized });
    ctx?.ui?.notify?.(`Lexis-Two mode set to ${normalized}.`, "info");
  };

  const sendAlias = (skillName, args, ctx) => {
    const normalized = String(args || "").trim();
    const message = normalized ? `${skillName} ${normalized}` : skillName;

    if (ctx?.isIdle?.() === false) {
      pi.sendUserMessage(message, { deliverAs: "followUp" });
      ctx?.ui?.notify?.(`${skillName} queued as follow-up.`, "info");
      return;
    }

    pi.sendUserMessage(message);
  };

  pi.registerCommand("lexis-two", {
    description: "Set or report Lexis-Two mode",
    handler: async (args, ctx) => {
      const parsed = parseLexisCommand(args, configuredDefaultMode);

      if (parsed.type === "status") {
        ctx?.ui?.notify?.(`Lexis-Two: current ${currentMode} • default ${configuredDefaultMode}`, "info");
        return;
      }

      if (parsed.type === "set-default") {
        const written = writeDefaultMode(parsed.mode);
        if (written) {
          configuredDefaultMode = getDefaultMode();
          const message = configuredDefaultMode === written
            ? `Default Lexis-Two mode set to ${written}.`
            : `Saved default ${written}, but env override keeps default at ${configuredDefaultMode}.`;
          ctx?.ui?.notify?.(message, "info");
        }
        return;
      }

      if (parsed.type === "set-mode") {
        setMode(parsed.mode, ctx);
        return;
      }

      ctx?.ui?.notify?.("Unknown or unsupported /lexis-two mode.", "warning");
    },
  });

  pi.registerCommand("lexis-two-review", {
    description: "Run /skill:lexis-two-review",
    handler: (_args, ctx) => sendAlias("/skill:lexis-two-review", "", ctx),
  });

  pi.registerCommand("lexis-two-audit", {
    description: "Run /skill:lexis-two-audit",
    handler: (_args, ctx) => sendAlias("/skill:lexis-two-audit", "", ctx),
  });

  pi.registerCommand("lexis-two-debt", {
    description: "Run /skill:lexis-two-debt",
    handler: (_args, ctx) => sendAlias("/skill:lexis-two-debt", "", ctx),
  });

  pi.registerCommand("lexis-two-plan", {
    description: "Run /skill:lexis-two-plan",
    handler: (_args, ctx) => sendAlias("/skill:lexis-two-plan", "", ctx),
  });

  pi.registerCommand("lexis-two-security", {
    description: "Run /skill:lexis-two-security",
    handler: (_args, ctx) => sendAlias("/skill:lexis-two-security", "", ctx),
  });

  pi.registerCommand("lexis-two-help", {
    description: "Run /skill:lexis-two-help",
    handler: (_args, ctx) => sendAlias("/skill:lexis-two-help", "", ctx),
  });

  pi.on("input", async (event) => {
    if (event?.source === "extension") return;

    const text = String(event?.text || "");
    if (currentMode !== "off" && /\b(stop lexis|normal mode)\b/i.test(text)) {
      setMode("off");
    }
  });

  pi.on("session_start", async (_event, ctx) => {
    const entries = ctx?.sessionManager?.getBranch?.() || ctx?.sessionManager?.getEntries?.() || [];
    configuredDefaultMode = getDefaultMode();
    currentMode = resolveSessionMode(entries, configuredDefaultMode);
  });

  pi.on("before_agent_start", async (event) => {
    if (!currentMode || currentMode === "off") return;
    return { systemPrompt: `${event.systemPrompt}\n\n${getLexisInstructions(currentMode)}` };
  });
}
