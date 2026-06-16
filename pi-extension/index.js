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

  pi.registerCommand("lexis", {
    description: "Manage Lexis senior dev mode, intensity levels, and quality/security tools",
    handler: async (args, ctx) => {
      const parsedArgs = String(args || "").trim();
      if (!parsedArgs) {
        ctx?.ui?.notify?.(`Lexis: current ${currentMode} • default ${configuredDefaultMode}`, "info");
        sendAlias("/skill:lexis-two-help", "", ctx);
        return;
      }

      const [subcommand, ...rest] = parsedArgs.toLowerCase().split(/\s+/);
      const restArgs = rest.join(" ");

      if (subcommand === "status") {
        ctx?.ui?.notify?.(`Lexis: current ${currentMode} • default ${configuredDefaultMode}`, "info");
        return;
      }
      if (subcommand === "plan" || subcommand === "p") {
        sendAlias("/skill:lexis-two-plan", restArgs, ctx);
        return;
      }
      if (subcommand === "review" || subcommand === "r") {
        sendAlias("/skill:lexis-two-review", restArgs, ctx);
        return;
      }
      if (subcommand === "audit" || subcommand === "a") {
        sendAlias("/skill:lexis-two-audit", restArgs, ctx);
        return;
      }
      if (subcommand === "debt" || subcommand === "d") {
        sendAlias("/skill:lexis-two-debt", restArgs, ctx);
        return;
      }
      if (subcommand === "security" || subcommand === "s") {
        sendAlias("/skill:lexis-two-security", restArgs, ctx);
        return;
      }
      if (subcommand === "help" || subcommand === "h") {
        sendAlias("/skill:lexis-two-help", restArgs, ctx);
        return;
      }

      const parsed = parseLexisCommand(parsedArgs, configuredDefaultMode);

      if (parsed.type === "set-default") {
        const written = writeDefaultMode(parsed.mode);
        if (written) {
          configuredDefaultMode = getDefaultMode();
          const message = configuredDefaultMode === written
            ? `Default Lexis mode set to ${written}.`
            : `Saved default ${written}, but env override keeps default at ${configuredDefaultMode}.`;
          ctx?.ui?.notify?.(message, "info");
        }
        return;
      }

      if (parsed.type === "set-mode") {
        setMode(parsed.mode, ctx);
        return;
      }

      ctx?.ui?.notify?.(`Unknown /lexis subcommand or mode: ${subcommand}. Type '/lexis help' for options.`, "warning");
    },
  });

  pi.registerCommand("lexis-two", {
    description: "Set or report Lexis-Two mode (alias for /lexis)",
    handler: async (args, ctx) => {
      const parsedArgs = String(args || "").trim();
      const [subcommand] = parsedArgs.toLowerCase().split(/\s+/);
      const validSubcommands = ["status", "plan", "p", "review", "r", "audit", "a", "debt", "d", "security", "s", "help", "h"];
      
      if (validSubcommands.includes(subcommand)) {
        ctx?.ui?.notify?.(`[Deprecated] Use '/lexis ${parsedArgs}' instead.`, "warning");
      }
      
      // Delegate to handleLexis logic via registering command
      return pi.commands["lexis"].handler(args, ctx);
    },
  });

  pi.registerCommand("specxis", {
    description: "Manage the Specxis Spec-Driven Development lifecycle (new, plan, implement, review, close, debt, status)",
    handler: (args, ctx) => sendAlias("/skill:specxis", args, ctx),
  });

  const makeDeprecatedHandler = (subcommand) => {
    return (args, ctx) => {
      ctx?.ui?.notify?.(`[Deprecated] Use '/lexis ${subcommand}' instead.`, "warning");
      sendAlias(`/skill:lexis-two-${subcommand}`, args, ctx);
    };
  };

  pi.registerCommand("lexis-two-review", {
    description: "[Deprecated] Use /lexis review instead",
    handler: makeDeprecatedHandler("review"),
  });

  pi.registerCommand("lexis-two-audit", {
    description: "[Deprecated] Use /lexis audit instead",
    handler: makeDeprecatedHandler("audit"),
  });

  pi.registerCommand("lexis-two-debt", {
    description: "[Deprecated] Use /lexis debt instead",
    handler: makeDeprecatedHandler("debt"),
  });

  pi.registerCommand("lexis-two-plan", {
    description: "[Deprecated] Use /lexis plan instead",
    handler: makeDeprecatedHandler("plan"),
  });

  pi.registerCommand("lexis-two-security", {
    description: "[Deprecated] Use /lexis security instead",
    handler: makeDeprecatedHandler("security"),
  });

  pi.registerCommand("lexis-two-help", {
    description: "[Deprecated] Use /lexis help instead",
    handler: makeDeprecatedHandler("help"),
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
