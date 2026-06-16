import test from "node:test";
import assert from "node:assert/strict";
import { resolveSessionMode, parseLexisCommand } from "../index.js";

test("resolveSessionMode resolves mode from branch entries", () => {
  const entries = [
    { type: "user-message", text: "hello" },
    { type: "custom", customType: "lexis-two-mode", data: { mode: "lite" } },
    { type: "assistant-message", text: "world" },
  ];
  assert.equal(resolveSessionMode(entries, "full"), "lite");
});

test("resolveSessionMode falls back to default mode if no entries", () => {
  assert.equal(resolveSessionMode([], "lite"), "lite");
});

test("parseLexisCommand parses empty command as default toggle", () => {
  assert.deepEqual(parseLexisCommand("", "full"), { type: "set-mode", mode: "full" });
  assert.deepEqual(parseLexisCommand("  ", "off"), { type: "set-mode", mode: "full" });
});

test("parseLexisCommand parses status command", () => {
  assert.deepEqual(parseLexisCommand("status"), { type: "status" });
});

test("parseLexisCommand parses default command", () => {
  assert.deepEqual(parseLexisCommand("default lite"), { type: "set-default", mode: "lite" });
  assert.deepEqual(parseLexisCommand("default invalid"), { type: "invalid", reason: "invalid-default-mode" });
});

test("parseLexisCommand parses mode command", () => {
  assert.deepEqual(parseLexisCommand("ultra"), { type: "set-mode", mode: "ultra" });
  assert.deepEqual(parseLexisCommand("invalid"), { type: "invalid", reason: "invalid-mode", mode: "invalid" });
});
