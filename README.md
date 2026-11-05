<p align="center">
  <img src="https://github.com/nitdraig/lexis-two/blob/main/site/public/new-logo.png?raw=true" width="160" alt="Lexis-Two">
</p>

<h1 align="center">Lexis-two</h1>

<p align="center">
  <em>The simple way to obtain the best code.</em><br>
  <small>Coding agents over-build. A portable ruleset that steers them: prove the feature, prefer the platform, ship the minimum. <code>/discx</code> → <code>/specx</code> → <code>/lexis</code>. After an agent writes something, <code>/slopx</code> is the anti-generic gate and <code>/desx</code> the design-quality pass, both beside the loop.</small>
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/nitdraig/lexis-two?style=flat-square&color=111111&label=stars" alt="Stars">
  <img src="https://img.shields.io/github/v/release/nitdraig/lexis-two?style=flat-square&color=111111&label=release" alt="Release">
  <img src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" alt="MIT license">
</p>

<p align="center">
  <sub>Benchmark harness inherited from <a href="benchmarks/">ponytail</a>; Lexis-Two-specific runs completed and published.</sub>
</p>

---

Benchmark harness and attribution: [ponytail](https://github.com/DietrichGebert/ponytail) by DietrichGebert (MIT).

---

## Excelso Open

This project is proud to be part of **Excelso Open**, our open-source and community-focused branch, championing collaborative technology and social impact projects. Learn more about our mission and other projects at [excelso.xyz](https://excelso.xyz).

---

## What is Lexis?

Lexis is a multi-agent ecosystem for shipping production web apps with **engineering discipline**, not prompt theater.

It coordinates specialized agents — planning, implementation, review, refactor, security — around one portable ruleset and a shared `skills/` catalog. The default stance is skeptical: prove the feature belongs, pick the simplest stack-native solution, and write the minimum that holds under real constraints.

**This package** (`@draig/lexis-two`) publishes that ruleset, `skills/`, and host adapters. Named coding agents (`lexis-one`, etc.) are a separate Lexis ecosystem layer — some private, none in this tarball. See [docs/portability.md](./docs/portability.md).

**See it in code:** [examples/](./examples/) — nine before/after pairs across Next.js, Express, and FastAPI.

### Ecosystem agent roles

| Agent              | Role                 | Scope                                |
| ------------------ | -------------------- | ------------------------------------ |
| `lexis-one`        | Primary coding agent | Implements, edits, runs bash         |
| `lexis-review`     | Strategic reviewer   | Evaluates changes, never edits       |
| `ui-architect`     | UX/UI architect      | Consults on design, never implements |
| `refactor-agent`   | Refactor specialist  | Large-scale code restructuring       |
| `security-auditor` | Security analyst     | Read-only, runs audit tools          |
| `design-auditor`   | Design quality       | Read-only except `DESIGN-AUDIT.md`   |
| `explorer`         | Codebase mapper      | Read-only, fast local model          |

### Principles

Simplicity here is **method**, not aesthetic minimalism.

| Principle | What it means in Lexis-Two |
| --------- | -------------------------- |
| **YAGNI** | Question every feature and abstraction before it exists — the ladder below is the gate |
| **KISS** | Stdlib, platform APIs, and boring one-liners beat new dependencies |
| **DRY** | One `skills/` source, thin host adapters — slash commands route, they do not fork logic |
| **SOLID** | Clear module and service boundaries — no abstractions nobody asked for |

Fewer tokens and fewer files are a **side effect** of correct, maintainable code — not the whole philosophy.

### The decision ladder

Before writing any code, stop at the first rung that holds:

1. Does this need to exist at all? (YAGNI)
2. Does the standard library already do this?
3. Does a native platform feature cover it?
4. Does an already-installed dependency solve it?
5. Can this be one line?
6. Only then: write the minimum code that works.

---

## Three-stage workflow, plus two passes beside it

1. **[/discx](./DISCOVERY.md)** (`/discovery`) — this MVP + `06-post-mvp.md`; later `/discx <next-slug>` to scale. Scaffold: `node scripts/discovery-init.js <slug>`
2. **[/specx](./SPECXIS.md)** (`/specxis`) — agree proposal + tasks, implement one task at a time
3. **`/lexis`** — keep intensity lean (review / debt / security)
4. **[/desx](./DESX.md)** — optional pass after UI work: audit design quality (consistency, hierarchy, accessibility), then `/desx apply`
5. **[/slopx](./docs/slopx.md)** — the anti-generic gate after an agent writes something: code leftovers, generic copy and default-looking design, plus the `desx` quality pass

Skip Discovery for clear bugs and one-line fixes. `/desx` and `/slopx` are beside that loop, not SDD phases.

---

## Stack profiles

Philosophy is stack-agnostic; conventions live in `stacks/<id>.md`. Detect the
profile for the task's files, then read only that profile.

| Marker | Profile | Status |
| --- | --- | --- |
| `next.config.*` / `next` dep | `node-ts` | Shipped |
| `astro.config.*` / `astro` dep | `js-astro` | Planned |
| `package.json` (+ TypeScript) | `node-ts` | Shipped |
| `pyproject.toml` / `requirements.txt` / `Pipfile` | `python` | Planned |
| `go.mod` | `go` | Planned |
| `Cargo.toml` | `rust` | Planned |

See [docs/stacks.md](./docs/stacks.md) for detection, configuration, and adding a profile.

---

## Installation

### One-command setup (rules-only hosts)

From your project directory:

```bash
npx @draig/lexis-two install
```

Non-interactive example (Cursor + OpenCode + `AGENTS.md`):

```bash
npx @draig/lexis-two install --host cursor,opencode,agents --scope project --yes
```

Hosts covered: Cursor, Windsurf, Cline, Kiro, OpenCode (`opencode.json` merge + slash commands), `copilot-repo`, and project `AGENTS.md`. Plugin marketplaces (`claude`, `copilot`, `gemini`, `pi`) print setup hints. See [docs/setup.md](./docs/setup.md). Modes: [docs/modes.md](./docs/modes.md).

Uninstall (removes only unchanged Lexis-Two files):

```bash
npx @draig/lexis-two install --uninstall --host cursor,opencode --scope project --yes
```

What to know about the installer:

- **It needs `--yes` without a terminal.** In CI or a pipe, an install or uninstall that would write files stops with an error and writes nothing. `--dry-run` always works.
- **Upgrades are safe.** It records what it wrote in `.lexis-two/manifest.json` (commit it). Running it again after a package upgrade updates the files you did not edit, uninstall removes them even after an upgrade, and files you edited are left alone and reported. Backups never overwrite each other (`.bak`, `.bak.1`, ...).
- **`--scope global` never writes to the project.** Hosts with no global form are skipped with a visible line, and `stacks/` is project-only.
- **Uninstalling one host keeps `stacks/`** while another host still needs it.
- **`status` and `--json` show what is installed.** `npx @draig/lexis-two status` lists detected and installed hosts; `install --json` prints the same as a read-only report. `status` and an interactive `install` also print one line when a newer version is on npm (turn off with `--no-update-check`). See [docs/setup.md](docs/setup.md#status).

### OpenCode (Recommended via npm)

Add the package to your project's `opencode.json`:

```json
{
  "plugin": ["@draig/lexis-two"]
}
```

To enable the slash commands globally in any project:

```bash
mkdir -p ~/.config/opencode/commands
cp .opencode/commands/lexis*.md ~/.config/opencode/commands/
cp .opencode/commands/specx*.md ~/.config/opencode/commands/
cp .opencode/commands/disc*.md ~/.config/opencode/commands/
cp .opencode/commands/desx*.md ~/.config/opencode/commands/
```

### OpenCode (Local development / manual)

```bash
# Clone the repo
git clone https://github.com/nitdraig/lexis-two.git ~/lexis-two
```

Add to your `opencode.json`:

```json
{
  "plugin": ["~/lexis-two/.opencode/plugins/lexis-two.mjs"],
  "instructions": ["~/lexis-two/AGENTS.md"]
}
```

### Cursor

```bash
# Copy rules to your project or global Cursor config
cp ~/lexis-two/.cursor/rules/lexis-two.mdc .cursor/rules/lexis-two.mdc
```

Or globally:

```bash
cp ~/lexis-two/.cursor/rules/lexis-two.mdc ~/.cursor/rules/lexis-two.mdc
```

More hosts (Windsurf, Gemini CLI, pi, Copilot, Command Code): see [docs/portability.md](./docs/portability.md) and [docs/commandcode.md](./docs/commandcode.md).

**Site:** [lexis-two.excelso.xyz](https://lexis-two.excelso.xyz) (GitHub Pages — [setup guide](./docs/site.md)).
**Command usage guide:** [lexis-two.excelso.xyz/guide](https://lexis-two.excelso.xyz/guide) — `/discx`, `/specx`, `/lexis`, and `/desx`.

---

## Commands

Once installed, these slash commands are available in OpenCode, Gemini CLI, pi, and [Command Code](./docs/commandcode.md).

### 1. `/discx` — Discovery (alias `/discovery`)

Product framing **before** Specxis. Output: `docs/discovery/<slug>/` (seven files, including `06-post-mvp.md`). No product code.

* **`/discx <slug>`**
  * **What it does:** Asks B1–B8 in batches, fills brief / MVP / priorities / constraints / questions / map / post-MVP. Gate: continue to `/specx new <slug>`?
  * **When to use:** New product, vague feature, or **scale** after an MVP. For scale, use a **new** slug seeded from the previous `06-post-mvp.md` — do not overwrite the old folder.
  * **Skip:** bugs, typos, hotfixes, one-file changes. Bypass later Specxis with `sin discovery`.

Scaffold without an LLM: `node scripts/discovery-init.js <slug>`

---

### 2. `/lexis` — Core Lexis Commands
Manage Lexis senior dev mode, intensity levels, and quality/security tools under a single unified command.

#### Subcommands in Detail:

* **`/lexis status` (Shortcut: `/lexis`)**
  * **What it does:** Reports the current active mode of the plugin (lite/full/ultra/off) and your configured default mode. It never changes the level: only `/lexis <lite | full | ultra | off>` does.
  * **When to use:** Use this to verify which intensity level is currently guiding your AI agent.

* **`/lexis <lite | full | ultra | off>`**
  * **What it does:** Dynamically switches the intensity level of the smart-lazy ruleset.
    * `lite`: Builds what's asked but suggests a lazier alternative in one line.
    * `full` (Default): Enforces the strict minimalist ladder (YAGNI, stdlib, native, one line, minimum build).
    * `ultra`: YAGNI extremist mode. Challenges requirements, deletes code first, and prefers one-liners.
    * `off`: Fully deactivates Lexis rules for the current session.
  * **When to use:** Use `ultra` when starting a refactoring or cleanup sprint; use `lite` when you have strict, non-negotiable specifications.

* **`/lexis plan` (Shortcut: `/lexis p`)**
  * **What it does:** Step-by-step technical plan *before* code: lazy ladder, plus clarify (max 3 questions), repo/docs sources, proposed vs lazy, and happy/edge/failure. One shippable slice; defer the rest.
  * **When to use:** Before any new feature so you agree the simplest path.

* **`/lexis review` (Shortcut: `/lexis r`)**
  * **What it does:** Analyzes your recent git changes (`git diff HEAD`) specifically for over-engineering, dead code, speculative features, reinvented standard libraries, or unnecessary abstractions. It runs once; it does not become the active level.
  * **When to use:** Run this before committing or opening a Pull Request to ensure your code is as lean and maintainable as possible.

* **`/lexis audit` (Shortcut: `/lexis a`)**
  * **What it does:** Performs a comprehensive, read-only audit of your entire repository (not just a diff) to identify over-engineering, unused dependencies, and redundant boilerplate.
  * **When to use:** Excellent for onboarding onto a new codebase or doing a monthly code cleanup.

* **`/lexis debt` (Shortcut: `/lexis d`)**
  * **What it does:** Recursively scans the codebase for `// lexis:` comment tags and compiles them into a prioritized technical debt ledger, categorizing them into *Immediate*, *Next Sprint*, *Backlog*, and *Permanent*.
  * **When to use:** Run this to check what shortcuts were taken and when they need to be upgraded.

* **`/lexis security` (Shortcut: `/lexis s`)**
  * **What it does:** Runs a focused security audit on your stack (optimized for Node.js, Next.js, and MongoDB), checking for NoSQL injection, command injection, XSS, missing route middleware, hardcoded secrets, and unvalidated inputs.
  * **When to use:** Run this before any production deployment or security review.

* **`/lexis help` (Shortcut: `/lexis h`)**
  * **What it does:** Displays a quick reference card with public commands, levels, and configuration.

Bugs: smallest repro and fix (no drive-by refactors). Those habits live in `plan` / AGENTS — old v1.2 slash names (`doubt`, `inc`, `debug`, `source`, `predict`, `scenario`) redirect to `/lexis plan`. Prefer `/discx` over `/lexis discovery`. Folded skill folders remain; their standalone slash adapters are gone. Legacy `/lexis-two-review` (etc.) still work with a deprecation notice. Skill folders remain `skills/lexis-two-*`. Legacy `/lexis-two-*` slash names still work with a deprecation notice.

---

### 3. `/specx` — Spec-Driven Development (alias `/specxis`)
Manage the Specxis SDD lifecycle. Short command **`/specx`**. Same subcommands as `/specxis`.

#### Subcommands in Detail:

* **`/specx status` (also `/specxis`)**
  * **What it does:** Lists all active specifications in `.specxis/active/`, displaying their current status (draft/agreed/implementing/done), task completion progress (e.g., `3/5 tasks checked`), and whether a review has been completed. It also shows a summary of archived specs and open debt.
  * **When to use:** Use this as your central dashboard to see what features are currently in development and their progress.

* **`/specx new <slug>`** (also `/specxis new`)
  * **What it does:** Creates `.specxis/active/[slug]/proposal.md`. Lazy check plus **Discovery soft gate**: vague products without `docs/discovery/<slug>/01-mvp.md` are pointed at `/discx` first (`no discovery` or `sin discovery` bypasses). Cites Discovery source when present.
  * **When to use:** Complex feature (3+ files) or UX/backend coordination — after Discovery when the idea was vague.

* **`/specx plan <slug>`**
  * **What it does:** Reads your `proposal.md`, applies the lazy decision hierarchy, and generates `spec.md` (MUST/SHOULD/MAY) and `tasks.md` (a technical task list, max 10 tasks, each task one concern with its own tests). The spec starts as `draft` and becomes `agreed` when you approve it. Re-running it keeps tasks that are already checked.
  * **When to use:** Run this once the initial proposal is aligned to generate a structured, actionable implementation plan.

* **`/specx implement <slug>`**
  * **What it does:** Refuses a spec that is not `agreed`. Records the base commit on the first run (status becomes `implementing`), finds the first unchecked task in your `tasks.md`, implements it following the `spec.md` MUST requirements and `AGENTS.md` rules, and marks the task as completed (`- [x]`). It implements exactly one task per run to ensure maximum control and quality.
  * **When to use:** Use this to guide the AI agent step-by-step through the implementation of your feature.

* **`/specx review <slug>`**
  * **What it does:** Runs a read-only evaluation of the diff since the base commit (so checkpoint commits stay in the review) against the requirements in `spec.md` and the rules of `AGENTS.md`. It writes its findings as checkboxes (Severity, Location, Issue, Fix) to `review.md`.
  * **When to use:** Run this after implementing your tasks to verify that the feature is fully compliant and clean before closing.

* **`/specx close <slug>`**
  * **What it does:** Verifies that all tasks are completed, `review.md` exists and no Critical/High finding is unticked. A criterion nobody can verify is closed only by a waiver you write in `review.md`. It then sets the status to `done`, moves the spec folder to `.specxis/archive/[slug]/`, and syncs the `// lexis:` comments into your global `.specxis/debt.md` ledger.
  * **When to use:** Run this when your feature is fully implemented, tested, and ready to be archived.

* **`/specx debt`**
  * **What it does:** Recursively scans the codebase for `// lexis:` comments and synchronizes them with `.specxis/debt.md` using a highly portable Node.js script. It rewrites only its own block between `<!-- lexis-debt:start -->` and `<!-- lexis-debt:end -->`; your notes and ticked entries stay.
  * **When to use:** Run this to keep your technical debt ledger perfectly in sync with your codebase.

---

### 4. `/desx` — Design audit
Beside the SDD loop (not a Specxis phase). Stack-agnostic detector + optional model polish.

* **`/desx` / `/desx audit`** (also `/desx-audit`)
  * **What it does:** Role `design-auditor`. Runs `scripts/desx-audit.js` (no API key) and writes only `DESIGN-AUDIT.md`.
  * **When to use:** After UI generation or before a commit, to check consistency with your design system, hierarchy, accessibility and readability. For output that merely looks generic, use `/slopx`.

* **`/desx apply`** (also `/desx-apply`)
  * **What it does:** Implementer reads the audit file, applies P0→P1→P2/P3, ticks only what it fixed, re-runs the detector.
  * **When to use:** After you agree the findings. Not the auditor.

More: [DESX.md](./DESX.md).

### 5. `/slopx` — Anti-generic gate
Beside the SDD loop. Keeps a change from looking or reading like default AI output. It always runs four passes: `code` (debug calls, TODOs, commented-out code, empty catches), `copy` (emojis, placeholder text, stock marketing words, invented data), `look` (side-stripe borders, gradient text, hard shadows, default palettes) and `quality` (the `desx` checks, run as a sub-skill). Findings come with a suggestion; taste rules are advisory and a brand can waive them.

* **`/slopx`**
  * **What it does:** Runs `scripts/slopx-audit.js` on what changed (added lines plus untracked files), reads the flagged lines, and reports in two groups: Generic and Design quality. Read-only: no files are written.
  * **When to use:** After an agent wrote code, text or UI, and before you commit. `--all` scans the whole tree, `--base <ref>` reviews a branch, `--prose` includes Markdown prose.

Optional: an opt-in hook that checks each edited file right after the agent edits it, and a `handoff` hint per finding that names the [Impeccable](https://github.com/pbakaus/impeccable) command that applies that kind of fix (Impeccable is not required). More: [docs/slopx.md](./docs/slopx.md).

---

## Reply language

Lexis does not force a language: the agent answers in the language you write in. To pin one, set `LEXIS_TWO_LANGUAGE=Spanish` (or `{ "language": "Spanish" }` in `~/.config/lexis-two/config.json`). The value must be a plain language name; anything else is ignored, and code, comments and docs stay in English. Cursor, Windsurf, Cline, Kiro and `AGENTS.md` load a fixed copy of the rules, so add one line to your own project rules there. Details: [docs/setup.md](./docs/setup.md#language).

---

## Modes

Switch working mode with `/mode <name>` in OpenCode:

| Mode         | Focus                          | Best for               |
| ------------ | ------------------------------ | ---------------------- |
| `build`      | Minimum viable implementation  | Day-to-day coding      |
| `plan`       | Analysis before implementation | Complex features       |
| `review`     | Evaluate, no edits             | Before committing      |
| `debug`      | Trace issues, no edits         | Investigating bugs     |
| `docs`       | JSDoc, README, comments        | Documentation sprints  |
| `brainstorm` | Ideas and trade-offs           | Architecture decisions |

---

## The `lexis:` Comment Tag

Lexis marks intentional simplifications with inline comments:

```typescript
// lexis: using native <dialog> instead of modal library — no dep needed
// lexis: skipping abstraction — only used once, extract if needed in v2
// lexis: tech debt — revisit when auth module is stable
```

Run `/lexis debt` (or `/lexis d`) to collect and prioritize all tagged items across the codebase.

---

## Complementary Repos

| Repo | What it adds |
| ---- | ------------ |
| [ponytail](https://github.com/DietrichGebert/ponytail) | Benchmark harness and early decision-ladder patterns (MIT) |
| [my-cursor-skills](https://github.com/nitdraig/my-cursor-skills) | OpenCode/Cursor skills: code review, testing, security, performance |

---

## Roadmap

### Component Relationship

```
Lexis-One (private) ──extracts the best──▶ Lexis-Two (public)
     │                                           │
     │ personal configuration                    │ portable ecosystem
     │ specific prompts & flow                   │ generalized rules
     │ providers & API keys                      │ skills & commands
     │ private working style                     │ multi-host adapters
     └───────────────────────────────────────────┘
                          │
                    Lexis-Core (future)
                    public orchestrator
```

---

### v0.1 — Foundation ✅

Core portable ecosystem.

- [x] `AGENTS.md` — ecosystem rules and minimalist decision hierarchy
- [x] OpenCode plugin (`lexis-two.mjs`) with lite / full / ultra modes
- [x] Commands: `lexis-two-review`, `lexis-two-audit`, `lexis-two-debt`, `lexis-two-plan`, `lexis-two-security`
- [x] Portable skills for all hosts
- [x] Adapters: Cursor, Windsurf, Cline, Kiro, Gemini CLI, OpenCode; Copilot repo rules (`.github/copilot-instructions.md`)
- [x] MIT license with ponytail attribution

---

### v0.2 — Developer Experience

Make it easy to adopt Lexis in any new project.

- [ ] `AGENTS.template.md` — project-level AGENTS.md template with commented sections (stack, design tokens, glossary, conventions)
- [x] `docs/portability.md` — hosts, commands, skills, install paths
- [x] `docs/site.md` — GitHub Pages + `lexis-two.excelso.xyz`
- [x] `docs/setup.md` — installer guide (OpenCode merge + global commands)
- [x] `docs/modes.md` — lite / full / ultra / off and default resolution
- [x] `npx @draig/lexis-two install` — setup script (rules, OpenCode, uninstall, hints)
- [x] README links to `examples/` before/after catalog
- [x] `examples/nextjs/01-modal-library` — gold-standard before/after (B1)
- [x] `examples/nextjs/` + `examples/express/` — six before/after cases (B2)
- [x] `examples/fastapi/` — three before/after cases (B3)

---

### v0.3 — Multi-host Maturity

Full, verified support across all major hosts.

- [x] Claude Code adapter (`.claude-plugin/` + `hooks/`) — scaffold in repo
- [x] GitHub Copilot IDE plugin (`.github/plugin/`) — scaffold in repo
- [x] Codex adapter (`.codex-plugin/plugin.json` + `hooks/hooks.json`)
- [x] pi adapter (`pi-extension/`)
- [x] Verified skills working in Gemini CLI, Codex, and pi
- [x] `examples/` — nine before/after cases across Next.js, Express, FastAPI (B1–B3)
- [x] `CONTRIBUTING.md` — how to add a new adapter or skill

---

### v0.4 — Lexis-Core (Public Orchestrator)

The public orchestrator — a generalized pattern extracted from the private Lexis-One ecosystem.

- [ ] Public documentation of the multi-agent role architecture (without exposing private config)
- [ ] Guide: how to build a multi-agent ecosystem using Lexis-Two as the base
- [ ] `lexis-core` as a reference agent in the docs — prompts and patterns, not private implementation
- [ ] Guide: "How to build your own private Lexis-One on top of Lexis-Two"
- [ ] `opencode.json` template with the full agent ecosystem (no keys, placeholders only)

---

### v0.5 — Specxis (Spec-Driven Development) ✅

Lightweight SDD layer for complex features — inspired by OpenSpec and Spec Kit,
built for the Lexis philosophy.

- [x] `.specxis/` folder convention documented
- [x] Commands: specxis-new, specxis-plan, specxis-implement, specxis-review, specxis-close, specxis-debt
- [x] Skills: specxis, specxis-plan, specxis-review, specxis-close
- [x] `scripts/specxis-init.js` — creates .specxis/ structure in any project
- [x] `templates/specxis/` — proposal, spec, and tasks templates
- [x] `docs/specxis.md` — when to use SDD vs direct implementation
- [ ] Integration guide for Lexis-One private config

---

### v1.3 — Discovery (product framing)

MVP cut and map **before** Specxis. Output: `docs/discovery/<slug>/`.

- [x] `templates/discovery/` + `DISCOVERY.md` / `docs/discovery.md`
- [x] `scripts/discovery-init.js` + tests
- [x] Slash commands `/discx` (`/discovery`) + skill + installer copy
- [x] Specxis soft gate + proposal “Discovery source” section

---

### v1.3.x — Desx (design audit)

- [x] `/desx` audit/apply + `scripts/desx-audit.js` + `DESIGN-AUDIT.md`

---

### v1.4 — Stack profiles ✅

Core `AGENTS.md` stays stack-agnostic; conventions move to `stacks/<id>.md` and are detected per task.

- [x] `stacks/node-ts.md` (moved shortcuts + TypeScript rules + detection + tools) and `stacks/_template.md`
- [x] `AGENTS.md` "Stack profiles" detection table + load rules; TypeScript rules leave the core
- [x] Installer copies `stacks/` (skips existing files unless `--force`); `package.json` `files` include `stacks/`
- [x] `lexis-two-security` and `lexis-two-audit` are profile-aware (generic checks when no profile)
- [x] Landing: stack-profile welcome banner + "agnostic by design" section

---

### v1.5 — Quality gates ✅

Broken install channels fixed, state made trustworthy, and a gate against generic output.

- [x] Distribution: valid Claude plugin manifests, a postinstall that patches the OpenCode wrapper, installer hints that point to published files, configurable reply language
- [x] Mode state: only `/lexis <level>` changes the level; resume and compaction keep it; `normal mode` switches off only as a whole prompt
- [x] Specxis lifecycle: real status, approval gate, base commit, checkbox findings and waivers; a debt ledger that never overwrites your notes
- [x] Desx: stable finding ids, `--git` that sees untracked files, `--json`/`--dry-run` that write nothing, fewer false positives; repositioned as design quality
- [x] Installer: unique backups, shared `stacks/`, global scope that stays out of the project, `--yes` required without a TTY, manifest-based upgrades
- [x] `/slopx`: the anti-generic gate (code, copy, look, plus the desx quality pass), with an opt-in hook and optional Impeccable handoff
- [x] CI: syntax lint, Windows leg, site build job

---

### v1.0 — Community & Growth

When the ecosystem is stable and has adoption.

- [x] GitHub Actions CI: validates that adapters stay in sync when `AGENTS.md` changes
- [ ] Strict semantic versioning + automated changelog
- [ ] Community-verified skill registry
- [ ] Migration guides between versions

---

### Future — Lexis Platform

The commercial evolution. Defined once v1.0 has traction.

- [ ] Web app to configure your Lexis ecosystem visually
- [ ] Skill and adapter marketplace
- [ ] Lexis-One as a Service — your private configuration in the cloud
- [ ] Public Lexis-Core API for integration into any workflow

## Contributing

Contributions welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md) for architecture, host/skill/command checklists, and the PR contract. [AGENTS.md](./AGENTS.md) applies to this repo too.

Focus areas: add a `stacks/<id>.md` profile + detection-table row, new examples, additional hosts, installer improvements.

---

## License

MIT — see [LICENSE](./LICENSE).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

Original ponytail concept by [DietrichGebert](https://github.com/DietrichGebert/ponytail).
Lexis ecosystem by [@nitdraig](https://github.com/nitdraig).
