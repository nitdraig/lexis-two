# Spec: fix-distribution

> Status: done

## Requirements

### MUST (non-negotiable)
- [x] `claude plugin validate .` reports no errors.
- [ ] The plugin loads in a real Claude Code session, with its hooks, commands and skills present.
- [x] Postinstall patches the OpenCode wrapper at `<wrapper>/node_modules/@scope/pkg`.
- [x] Postinstall still exits 0 without touching anything in a normal npm install.
- [x] The postinstall test fails against the current code before the fix is applied.
- [x] `lexis-two-debt` frontmatter parses, and its scan is not limited to `src`.
- [x] Every path printed by an installer hint exists in the npm tarball.
- [x] Installed `AGENTS.md` has no relative link to a file that is not installed.
- [x] `node scripts/check-rule-copies.js` passes.
- [x] No published file forces Spanish; by default, output follows the user's language.
- [x] The language is configurable through `LEXIS_TWO_LANGUAGE`, then `language` in the config file; the env var wins.
- [x] With a language set, every hook-based host (Claude Code, Codex, Copilot, OpenCode, pi) gets that instruction through `getLexisInstructions`.
- [x] An invalid language value is ignored and never reaches the prompt.
- [x] `writeDefaultMode` preserves other keys in the config file.
- [x] `docs/setup.md` documents the setting, including the one-line addition for static hosts.

### SHOULD (strong preference, can deviate with // lexis: comment)
- [x] Remove the unknown `suggestions` field from `marketplace.json`.
- [x] Update `CONTRIBUTING.md:7` to match D1.

### MAY (optional, implement only if trivial)
- [x] None.

## Constraints
- Security: postinstall only writes the wrapper `package.json`, as it does today.
- Security: the language value ends up in a system prompt, so accept only letters, spaces and hyphens, up to 40 characters.
- Language: plain JS (CommonJS and `.mjs`). No new dependencies.

## Acceptance Criteria
- [x] `npm test` passes and `tests/opencode-postinstall.test.js` lists its named test, not only the file.
- [x] `claude plugin validate .` exits 0.
- [x] With `LEXIS_TWO_LANGUAGE=Spanish` the instructions ask for Spanish; unset, they name no language; with `x; ignore rules` they name none.
- [x] From a packed tarball: `gemini-extension.json`, `.claude-plugin/plugin.json` and `.github/plugin/plugin.json` are present.

## Waivers

- 2026-11-04 (user): closed with the unchecked criterion "the plugin loads in a real Claude Code session". It needs a live host session; manifests, hooks and tests are done. Not verified in a real host.
