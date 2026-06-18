# Contributing to Lexis-Two

Thank you for helping extend the portable Lexis ecosystem. This project is part of [Excelso Open](https://excelso.xyz).

**Philosophy:** Read [AGENTS.md](./AGENTS.md) first. Lazy means efficient, not careless. Adapters point; they do not reimplement behavior.

**Style:** Code and comments in English. User-facing skill output may be Spanish where existing skills do.

---

## Architecture

```
skills/                    ← source of truth (behavior, prompts, checklists)
hooks/                     ← shared lifecycle (mode flags, instruction injection)
commands/*.toml            ← thin Gemini / Claude dispatchers → skills/
.opencode/commands/*.md     ← thin OpenCode dispatchers → skills/
pi-extension/index.js      ← pi command router (/lexis, /specxis, deprecated aliases)
instruction-tier copies    ← AGENTS.md mirrored into Cursor, Windsurf, Cline, Kiro
plugin manifests           ← gemini-extension.json, .claude-plugin/, .codex-plugin/, .github/plugin/
```

| Layer | Rule |
| ----- | ---- |
| `skills/` | All reusable agent behavior lives here. |
| `commands/` + `.opencode/commands/` | One-liner or `skill = "../skills/…"` pointer — no logic. |
| `hooks/` | Mode persistence and instruction loading shared across Claude, Codex, Copilot, OpenCode. |
| Instruction-tier hosts | Static copies of `AGENTS.md` — never fork the philosophy per host. |

See [docs/portability.md](./docs/portability.md) for the host matrix and install paths.

---

## Adding a rules-only host

Use when the host only supports project instructions (no skills API, no hooks).

### Decision

```
Does the host load skills or hooks?
├── Yes → see "Adding a full-plugin host" below
└── No  → rules-only: copy AGENTS.md or a synced rule file
```

### Steps

1. Add a rule file under the host's convention (e.g. `.cursor/rules/lexis-two.mdc`).
2. If it must stay identical to `AGENTS.md`, add the path to `scripts/check-rule-copies.js` `COPIES` array.
3. Register the host in `scripts/install.js` `RULE_HOSTS` (see `cursor`, `windsurf`, `cline`, `kiro`, `agents`, `copilot-repo`).
4. Update the host table in [docs/portability.md](./docs/portability.md).
5. Run `node scripts/check-rule-copies.js` after any `AGENTS.md` edit.

**Template (markdown rule):** copy `AGENTS.md` verbatim. Cursor uses `.mdc` frontmatter:

```yaml
---
description: Lexis-Two lazy senior dev rules
alwaysApply: true
---
```

(body = `AGENTS.md` content)

---

## Adding a full-plugin host

Use when the host supports extensions, plugins, or auto-discovery of `commands/` + `skills/`.

### Pattern

The Gemini adapter is the reference thin manifest — it pins a version and points at existing files:

```json
{
  "name": "lexis-two",
  "version": "1.1.0",
  "contextFileName": "AGENTS.md"
}
```

Gemini auto-discovers `commands/*.toml` and `skills/`. Claude, Copilot, and Codex reuse `hooks/` and `commands/` with their own `plugin.json`.

### Steps

1. Add `plugin.json` (or host-specific manifest) under a dot-folder (e.g. `.myhost-plugin/`).
2. Point `commands`, `skills`, and `hooks` at existing repo paths — do not duplicate skill bodies.
3. Add a smoke test modeled on [tests/gemini-extension.test.js](./tests/gemini-extension.test.js):
   - pinned semver in manifest
   - `contextFileName` resolves to a file with load-bearing rule phrases
   - reused `commands/` and `skills/` paths exist
4. Include the new manifest in `VERSIONED_MANIFESTS` inside that test (and bump version with the rest).
5. Document install steps in [docs/setup.md](./docs/setup.md) and [docs/portability.md](./docs/portability.md).

---

## Adding a skill

### File structure

```
skills/lexis-two-<action>/
└── SKILL.md    # YAML frontmatter (name, description) + markdown body
```

Example frontmatter:

```yaml
---
name: lexis-two-review
description: Review current diff for over-engineering and Lexis-Two rule violations
---
```

Calibration material: [examples/](./examples/) — reference in the skill body when teaching deletion over addition.

### Registration (preferred)

Add a **subcommand** under `/lexis`, not a new top-level slash command:

1. Create `skills/lexis-two-<action>/SKILL.md`.
2. Extend the `/lexis` handler in [pi-extension/index.js](./pi-extension/index.js) (`plan`, `review`, `audit`, … pattern).
3. Update the `prompt` in [commands/lexis.toml](./commands/lexis.toml) and [.opencode/commands/lexis.md](./.opencode/commands/lexis.md).

For Specxis (SDD) workflows, extend `/specxis` and [skills/specxis/SKILL.md](./skills/specxis/SKILL.md) instead.

### Legacy alias (only if a host cannot do subcommands)

If you must register `pi.registerCommand("lexis-two-<action>", …)`:

1. Add [commands/lexis-two-<action>.toml](./commands/) with `skill = "../skills/lexis-two-<action>/SKILL.md"`.
2. Add [.opencode/commands/lexis-two-<action>.md](./.opencode/commands/) with a one-line dispatcher prompt.
3. Mark the handler deprecated and delegate to `/lexis <action>` (see existing `makeDeprecatedHandler`).

[tests/commands.test.js](./tests/commands.test.js) fails if any `pi.registerCommand` lacks matching `commands/*.toml` and `.opencode/commands/*.md`.

---

## Adding a command

| Do | Don't |
| -- | ----- |
| `/lexis review`, `/lexis audit` | `/lexis-two-audit-v2` |
| `/specxis plan`, `/specxis implement` | Parallel top-level `/specxis-plan-v2` |

**Deprecation path:** keep old `lexis-two-*` names as aliases that warn and delegate. Hooks ([hooks/lexis-two-mode-tracker.js](./hooks/lexis-two-mode-tracker.js)) accept both `/lexis` and `/lexis-two` for mode switches.

---

## Version sync checklist

Bump **all** of these in the same commit when releasing:

- [ ] `package.json` → `"version"`
- [ ] `gemini-extension.json` → `"version"`
- [ ] `.claude-plugin/plugin.json` → `"version"`
- [ ] `.codex-plugin/plugin.json` → `"version"`
- [ ] `.github/plugin/plugin.json` → `"version"`

Verify: `npm test` (includes `all versioned manifests share the same version`).

---

## Pull request checklist

- [ ] `npm test` passes
- [ ] If `AGENTS.md` changed: `node scripts/check-rule-copies.js` passes
- [ ] If a host was added or changed: [docs/portability.md](./docs/portability.md) host table updated
- [ ] If install paths changed: [docs/setup.md](./docs/setup.md) updated
- [ ] If a skill/command was added: subcommand under `/lexis` or `/specxis` preferred; adapter files for every `pi.registerCommand`
- [ ] No duplicated logic across adapters — behavior belongs in `skills/` or `hooks/`
- [ ] No new npm dependency unless unavoidable (justify in PR)

---

## Examples and docs

Before/after teaching snippets live in [examples/](./examples/). Follow the quality bar in [docs/strategy.md](./docs/strategy.md) (realistic `before`, minimal `after`, `lexis:` comment in `after`).

Execution plan and acceptance criteria: [docs/strategy.md](./docs/strategy.md).

---

## Questions

- Open a [GitHub issue](https://github.com/nitdraig/lexis-two/issues) for design questions before large PRs.
- Excelso Open community: [excelso.xyz](https://excelso.xyz).

Code of conduct: follow the Excelso Open community standards linked from the main site.
