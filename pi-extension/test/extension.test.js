import test from "node:test";
import assert from "node:assert/strict";
import lexisExtension from "../index.js";

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

  pi.commands["lexis-two-review"].handler("", ctx);
  assert.equal(pi.userMessages[7].text, "/skill:lexis-two-review");
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

  // Send input "stop lexis"
  await pi.listeners["input"]({ text: "Please stop lexis now" });
  assert.equal(pi.entries[1].data.mode, "off");
});
