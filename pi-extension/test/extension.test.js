import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import lexisExtension, { LEXIS_SKILL_ROUTES, LEXIS_COMPAT_ROUTES } from "../index.js";

class MockPi {
  constructor() {
    this.commands = {};
    this.listeners = {};
    this.entries = [];
    this.userMessages = [];
  }

  registerCommand(name, config) {
    this.commands[name] = config;
  }

  on(event, handler) {
    this.listeners[event] = handler;
  }

  appendEntry(type, data) {
    this.entries.push({ type, data });
  }

  sendUserMessage(text, options) {
    this.userMessages.push({ text, options });
  }
}

test("lexisExtension registers commands and listeners", () => {
  const pi = new MockPi();
  lexisExtension(pi);

  assert.ok(pi.commands["lexis"]);
  assert.ok(pi.commands["lexis-two"]);
  assert.ok(pi.commands["lexis-two-review"]);
  assert.ok(pi.commands["lexis-two-audit"]);
  assert.ok(pi.commands["lexis-two-debt"]);
  assert.ok(pi.commands["lexis-two-plan"]);
  assert.ok(pi.commands["lexis-two-security"]);
  assert.ok(pi.commands["lexis-two-help"]);
  assert.equal(pi.commands["lexis-two-doubt-driven"], undefined);
  assert.ok(pi.commands["specxis"]);
  assert.ok(pi.commands["specx"]);
  assert.ok(pi.commands["discovery"]);
  assert.ok(pi.commands["discx"]);
  assert.ok(pi.commands["desx"]);
  assert.ok(pi.commands["desx-audit"]);
  assert.ok(pi.commands["desx-apply"]);
  assert.ok(pi.commands["slopx"]);

  assert.ok(pi.listeners["input"]);
  assert.ok(pi.listeners["session_start"]);
  assert.ok(pi.listeners["before_agent_start"]);
});

test("lexisExtension command handlers trigger correctly", async () => {
  const pi = new MockPi();
  lexisExtension(pi);

  let notified = null;
  const ctx = {
    ui: {
      notify: (msg, type) => {
        notified = { msg, type };
      },
    },
  };

  await pi.commands["lexis-two"].handler("lite", ctx);
  assert.equal(pi.entries[0].type, "lexis-two-mode");
  assert.equal(pi.entries[0].data.mode, "lite");

  // Test the new unifed /lexis command
  await pi.commands["lexis"].handler("ultra", ctx);
  assert.equal(pi.entries[1].type, "lexis-two-mode");
  assert.equal(pi.entries[1].data.mode, "ultra");

  await pi.commands["lexis"].handler("plan", ctx);
  assert.equal(pi.userMessages[0].text, "/skill:lexis-two-plan");

  await pi.commands["lexis"].handler("review", ctx);
  assert.equal(pi.userMessages[1].text, "/skill:lexis-two-review");

  await pi.commands["lexis"].handler("doubt", ctx);
  assert.equal(pi.userMessages[2].text, "/skill:lexis-two-plan");
  assert.match(notified.msg, /Deprecated.*\/lexis plan/);

  await pi.commands["lexis"].handler("discx my-app", ctx);
  assert.equal(pi.userMessages[3].text, "/skill:discovery my-app");
  assert.match(notified.msg, /Deprecated.*\/discx/);

  await pi.commands["specxis"].handler("status", ctx);
  assert.equal(pi.userMessages[4].text, "/skill:specxis status");

  await pi.commands["specx"].handler("new demo", ctx);
  assert.equal(pi.userMessages[5].text, "/skill:specxis new demo");

  await pi.commands["discx"].handler("my-app", ctx);
  assert.equal(pi.userMessages[6].text, "/skill:discovery my-app");

  await pi.commands["desx"].handler("", ctx);
  assert.equal(pi.userMessages[7].text, "/skill:desx");

  await pi.commands["desx"].handler("apply", ctx);
  assert.equal(pi.userMessages[8].text, "/skill:desx-apply");

  await pi.commands["desx-audit"].handler("", ctx);
  assert.equal(pi.userMessages[9].text, "/skill:desx");

  pi.commands["lexis-two-review"].handler("", ctx);
  assert.equal(pi.userMessages[10].text, "/skill:lexis-two-review");

  await pi.commands["slopx"].handler("--all", ctx);
  assert.equal(pi.userMessages[11].text, "/skill:slopx --all");
});

test("lexisExtension input listener detects deactivation", async () => {
  const pi = new MockPi();
  lexisExtension(pi);

  let notified = null;
  const ctx = {
    ui: {
      notify: (msg, type) => {
        notified = { msg, type };
      },
    },
  };

  // Set mode to full first
  await pi.commands["lexis-two"].handler("full", ctx);
  assert.equal(pi.entries[0].data.mode, "full");

  // A sentence that merely mentions the phrase does not switch Lexis off
  await pi.listeners["input"]({ text: "Please stop lexis now" });
  await pi.listeners["input"]({ text: 'why does "normal mode" print this?' });
  assert.equal(pi.entries.length, 1);

  // The whole prompt being the phrase does
  await pi.listeners["input"]({ text: "stop lexis" });
  assert.equal(pi.entries[1].data.mode, "off");

  await pi.commands["lexis-two"].handler("lite", ctx);
  await pi.listeners["input"]({ text: "  Normal mode.  " });
  assert.equal(pi.entries[3].data.mode, "off");
});

test("/lexis-two works without pi.commands", async () => {
  // A host whose API has no `commands` registry: the handlers live in a private map.
  const registered = new Map();
  const pi = {
    registerCommand: (name, config) => registered.set(name, config),
    on: () => {},
    appendEntry: (type, data) => entries.push({ type, data }),
    sendUserMessage: (text) => messages.push(text),
  };
  const entries = [];
  const messages = [];
  assert.equal(pi.commands, undefined);
  lexisExtension(pi);

  await registered.get("lexis-two").handler("ultra", {});
  assert.equal(entries[0].data.mode, "ultra");
  await registered.get("lexis-two").handler("plan", {});
  assert.equal(messages[0], "/skill:lexis-two-plan");
});

test("every skill a pi command routes to exists", () => {
  const skillsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "skills");
  const ids = new Set([
    ...Object.values(LEXIS_SKILL_ROUTES),
    ...Object.values(LEXIS_COMPAT_ROUTES).map((r) => r.skillId),
    "specxis",
    "discovery",
    "desx",
    "desx-apply",
  ]);

  // Also every /skill:<id> the extension sends from its own commands
  const pi = new MockPi();
  lexisExtension(pi);
  for (const name of Object.keys(pi.commands)) {
    pi.commands[name].handler("", {});
  }
  for (const { text } of pi.userMessages) {
    const match = text.match(/^\/skill:([\w-]+)/);
    if (match) ids.add(match[1]);
  }

  for (const id of ids) {
    assert.ok(fs.existsSync(path.join(skillsDir, id, "SKILL.md")), `skills/${id}/SKILL.md is missing`);
  }
});
