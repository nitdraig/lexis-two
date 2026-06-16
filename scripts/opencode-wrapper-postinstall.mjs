#!/usr/bin/env node
// Patch OpenCode's npm cache wrapper package.json after install.
//
// OpenCode installs scoped plugins into ~/.cache/opencode/packages/@scope/pkg@latest/
// with a wrapper package.json that only lists dependencies. At runtime the loader
// reads that wrapper (not node_modules/@scope/pkg/package.json), so exports/main
// are missing and the plugin fails with "runtime load failed".

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const pkgRoot = path.dirname(path.join(fileURLToPath(import.meta.url), ".."));
const pkgJsonPath = path.join(pkgRoot, "package.json");

function isOpenCodeWrapperDir(dir) {
  const normalized = dir.replace(/\\/g, "/");
  return normalized.includes("/packages/") && normalized.endsWith("@latest");
}

function patchWrapperPackageJson(wrapperDir, packageName) {
  const wrapperPkgPath = path.join(wrapperDir, "package.json");
  if (!fs.existsSync(wrapperPkgPath)) return false;

  const wrapper = JSON.parse(fs.readFileSync(wrapperPkgPath, "utf8"));
  const pluginBase = `./node_modules/${packageName}/.opencode/plugins`;
  const next = {
    ...wrapper,
    main: `${pluginBase}/lexis-two.mjs`,
    exports: {
      ".": `${pluginBase}/lexis-two.mjs`,
      "./server": `${pluginBase}/lexis-two.mjs`,
      "./tui": `${pluginBase}/lexis-two-tui.mjs`,
    },
    "oc-plugin": ["server", "tui"],
  };

  fs.writeFileSync(wrapperPkgPath, `${JSON.stringify(next, null, 2)}\n`);
  return true;
}

try {
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
  const wrapperDir = path.resolve(pkgRoot, "../..");
  if (!isOpenCodeWrapperDir(wrapperDir)) process.exit(0);
  patchWrapperPackageJson(wrapperDir, pkg.name);
} catch {
  // lexis: postinstall is best-effort — normal npm installs must not fail
  process.exit(0);
}
