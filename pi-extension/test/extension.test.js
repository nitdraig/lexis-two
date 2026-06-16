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

  assert.ok(pi.commands["lexis-two"]);
  assert.ok(pi.commands["lexis-two-review"]);
  assert.ok(pi.commands["lexis-two-audit"]);
  assert.ok(pi.commands["lexis-two-debt"]);
  assert.ok(pi.commands["lexis-two-plan"]);
  assert.ok(pi.commands["lexis-two-security"]);
  assert.ok(pi.commands["lexis-two-help"]);

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
  assert.equal(notified.msg, "Lexis-Two mode set to lite.");

  pi.commands["lexis-two-review"].handler("", ctx);
  assert.equal(pi.userMessages[0].text, "/skill:lexis-two-review");
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
