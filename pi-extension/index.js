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

/** @type {Record<string, string>} Maps /lexis subcommand (and short alias) → skill id */
const LEXIS_SKILL_ROUTES = {
  plan: "lexis-two-plan",
  p: "lexis-two-plan",
  review: "lexis-two-review",
  r: "lexis-two-review",
  audit: "lexis-two-audit",
  a: "lexis-two-audit",
  debt: "lexis-two-debt",
  d: "lexis-two-debt",
  security: "lexis-two-security",
  s: "lexis-two-security",
  help: "lexis-two-help",
  h: "lexis-two-help",
  doubt: "lexis-two-doubt-driven",
  incremental: "lexis-two-incremental-impl",
  inc: "lexis-two-incremental-impl",
  debug: "lexis-two-debug-triage",
  triage: "lexis-two-debug-triage",
  source: "lexis-two-source-driven",
  src: "lexis-two-source-driven",
  predict: "lexis-two-predict",
  scenario: "lexis-two-scenario",
};

/** @type {Array<{ command: string, lexisSubcommand: string }>} */
const DEPRECATED_LEXIS_SKILL_COMMANDS = [
  { command: "lexis-two-review", lexisSubcommand: "review" },
  { command: "lexis-two-audit", lexisSubcommand: "audit" },
  { command: "lexis-two-debt", lexisSubcommand: "debt" },
  { command: "lexis-two-plan", lexisSubcommand: "plan" },
  { command: "lexis-two-security", lexisSubcommand: "security" },
  { command: "lexis-two-help", lexisSubcommand: "help" },
  { command: "lexis-two-doubt-driven", lexisSubcommand: "doubt" },
  { command: "lexis-two-incremental-impl", lexisSubcommand: "incremental" },
  { command: "lexis-two-debug-triage", lexisSubcommand: "debug" },
  { command: "lexis-two-source-driven", lexisSubcommand: "source" },
  { command: "lexis-two-predict", lexisSubcommand: "predict" },
  { command: "lexis-two-scenario", lexisSubcommand: "scenario" },
];

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

      const skillId = LEXIS_SKILL_ROUTES[subcommand];
      if (skillId) {
        sendAlias(`/skill:${skillId}`, restArgs, ctx);
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
      const validSubcommands = [
        "status",
        ...Object.keys(LEXIS_SKILL_ROUTES),
        "lite",
        "full",
        "ultra",
        "off",
        "default",
      ];
      
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

  const makeDeprecatedHandler = (lexisSubcommand, skillCommand) => {
    return (args, ctx) => {
      ctx?.ui?.notify?.(`[Deprecated] Use '/lexis ${lexisSubcommand}' instead.`, "warning");
      sendAlias(`/skill:${skillCommand}`, args, ctx);
    };
  };

  for (const { command, lexisSubcommand } of DEPRECATED_LEXIS_SKILL_COMMANDS) {
    pi.registerCommand(command, {
      description: `[Deprecated] Use /lexis ${lexisSubcommand} instead`,
      handler: makeDeprecatedHandler(lexisSubcommand, command),
    });
  }

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
