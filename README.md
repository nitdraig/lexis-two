<p align="center">
  <picture>
    <img src="https://github.com/nitdraig/lexis-two/blob/main/assets/logo.png" width="220" alt="Lexis-two">
  </picture>
</p>

<h1 align="center">Lexis-two</h1>

<p align="center">
  <em>The simple way to obtain the best code.</em><br>
  <small>Portable rules, skills, and slash commands — grounded in YAGNI, KISS, DRY, and SOLID, not bloat.</small>
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

Built on [OpenCode](https://opencode.ai) and [Cursor](https://cursor.sh).
Benchmark harness and attribution: [ponytail](https://github.com/DietrichGebert/ponytail) by DietrichGebert (MIT).

---

## Excelso Open

This project is proud to be part of **Excelso Open**, our open-source and community-focused branch, championing collaborative technology and social impact projects. Learn more about our mission and other projects at [excelso.xyz](https://excelso.xyz).

---

## What is Lexis?

Lexis is a multi-agent ecosystem for shipping production web apps with **engineering discipline**, not prompt theater.

It coordinates specialized agents — planning, implementation, review, refactor, security — around one portable ruleset and a shared `skills/` catalog. The default stance is skeptical: prove the feature belongs, pick the simplest stack-native solution, and write the minimum that holds under real constraints.

**See it in code:** [examples/](./examples/) — nine before/after pairs across Next.js, Express, and FastAPI.

### The Agents

| Agent              | Role                 | Scope                                |
| ------------------ | -------------------- | ------------------------------------ |
| `lexis-one`        | Primary coding agent | Implements, edits, runs bash         |
| `lexis-review`     | Strategic reviewer   | Evaluates changes, never edits       |
| `ui-architect`     | UX/UI architect      | Consults on design, never implements |
| `refactor-agent`   | Refactor specialist  | Large-scale code restructuring       |
| `security-auditor` | Security analyst     | Read-only, runs audit tools          |
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

## Stack

Lexis is optimized for this stack — adapt as needed for your own:

- **Frontend**: Next.js App Router, React, TypeScript strict
- **Backend**: Express.js / Fastify, Node.js, TypeScript
- **Database**: MongoDB (default) / PostgreSQL / SQLite
- **Cache**: Redis
- **Styling**: Tailwind CSS
- **Data fetching**: TanStack Query v5
- **Package Manager**: npm

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
cp .opencode/commands/specxis*.md ~/.config/opencode/commands/
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

More hosts (Windsurf, Gemini CLI, pi, Copilot): see [docs/portability.md](./docs/portability.md).

**Site:** [lexis-two.excelso.xyz](https://lexis-two.excelso.xyz) (GitHub Pages — [setup guide](./docs/site.md)).

---

## Commands

Once installed, these unified slash commands are available in OpenCode, Gemini CLI, and pi. They are designed to streamline your development process, enforce the minimalist Lexis philosophy, and manage technical debt.

### 1. `/lexis` — Core Lexis Commands
Manage Lexis senior dev mode, intensity levels, and quality/security tools under a single unified command.

#### Subcommands in Detail:

* **`/lexis status` (Shortcut: `/lexis`)**
  * **What it does:** Reports the current active mode of the plugin (lite/full/ultra/off) and your configured default mode.
  * **When to use:** Use this to verify which intensity level is currently guiding your AI agent.

* **`/lexis <lite | full | ultra | off>`**
  * **What it does:** Dynamically switches the intensity level of the smart-lazy ruleset.
    * `lite`: Builds what's asked but suggests a lazier alternative in one line.
    * `full` (Default): Enforces the strict minimalist ladder (YAGNI, stdlib, native, one line, minimum build).
    * `ultra`: YAGNI extremist mode. Challenges requirements, deletes code first, and prefers one-liners.
    * `off`: Fully deactivates Lexis rules for the current session.
  * **When to use:** Use `ultra` when starting a refactoring or cleanup sprint; use `lite` when you have strict, non-negotiable specifications.

* **`/lexis plan` (Shortcut: `/lexis p`)**
  * **What it does:** Produces a step-by-step technical plan for a requested feature *before* writing any code. It strictly applies the lazy decision hierarchy to ensure no over-engineering is designed.
  * **When to use:** Run this before starting any new feature to align with the agent on the simplest possible implementation path.

* **`/lexis review` (Shortcut: `/lexis r`)**
  * **What it does:** Analyzes your recent git changes (`git diff HEAD`) specifically for over-engineering, dead code, speculative features, reinvented standard libraries, or unnecessary abstractions.
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
  * **What it does:** Displays a quick reference card with all commands, levels, and configuration options.

#### Workflow skills (v1.2)

* **`/lexis doubt`** — Clarify ambiguous requirements (max 3 questions, no code).
* **`/lexis incremental` (or `inc`)** — Ship the smallest vertical slice; defer the rest.
* **`/lexis debug` (or `triage`)** — Repro, smallest fix, verify — no drive-by refactors.
* **`/lexis source` (or `src`)** — Ground in repo code and official docs before inventing APIs.
* **`/lexis predict`** — Compare proposed vs lazy approach (LOC, deps, maintenance).
* **`/lexis scenario`** — Happy, edge, and failure scenarios before design.

_(Skill folders remain `skills/lexis-two-*`. Legacy `/lexis-two-*` slash names still work with a deprecation notice.)_

---

### 2. `/specxis` — Spec-Driven Development (v0.5)
Manage the complete Specxis SDD lifecycle for complex features. Specxis ensures that developer-agent agreements are persisted as lightweight Markdown files in your repository, keeping requirements lean and focused.

#### Subcommands in Detail:

* **`/specxis status` (Shortcut: `/specxis`)**
  * **What it does:** Lists all active specifications in `.specxis/active/`, displaying their current status (draft/agreed/implementing/done), task completion progress (e.g., `3/5 tasks checked`), and whether a review has been completed. It also shows a summary of archived specs and open debt.
  * **When to use:** Use this as your central dashboard to see what features are currently in development and their progress.

* **`/specxis new <slug>`**
  * **What it does:** Creates a new spec folder at `.specxis/active/[slug]/` and initializes a `proposal.md` file from the Specxis template. It prompts you with the *lazy check* ("Does this feature need to exist? What is the absolute minimum?") to challenge the requirement before planning.
  * **When to use:** Run this when starting a complex feature that touches 3+ files or requires UX/backend coordination.

* **`/specxis plan <slug>`**
  * **What it does:** Reads your `proposal.md`, applies the lazy decision hierarchy, and generates `spec.md` (MUST/SHOULD/MAY) and `tasks.md` (a technical task list, max 10 tasks, with each task mapping to exactly one file or function).
  * **When to use:** Run this once the initial proposal is aligned to generate a structured, actionable implementation plan.

* **`/specxis implement <slug>`**
  * **What it does:** Finds the first unchecked task in your `tasks.md`, implements it following the `spec.md` MUST requirements and `AGENTS.md` rules, and marks the task as completed (`- [x]`). It implements exactly one task per run to ensure maximum control and quality.
  * **When to use:** Use this to guide the AI agent step-by-step through the implementation of your feature.

* **`/specxis review <slug>`**
  * **What it does:** Runs a read-only evaluation of the current implementation against the requirements in `spec.md` and the rules of `AGENTS.md`. It writes its findings (Severity, Location, Issue, Fix) to `review.md`.
  * **When to use:** Run this after implementing your tasks to verify that the feature is fully compliant and clean before closing.

* **`/specxis close <slug>`**
  * **What it does:** Verifies that all tasks are completed and no Critical/High findings are open. It then moves the spec folder to `.specxis/archive/[slug]/`, harvests any `// lexis:` comments added during development, and appends them to your global `.specxis/debt.md` ledger.
  * **When to use:** Run this when your feature is fully implemented, tested, and ready to be archived.

* **`/specxis debt`**
  * **What it does:** Recursively scans the codebase for `// lexis:` comments and synchronizes them with `.specxis/debt.md` using a highly portable Node.js script.
  * **When to use:** Run this to keep your technical debt ledger perfectly in sync with your codebase.

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

### v1.0 — Community & Growth

When the ecosystem is stable and has adoption.

- [ ] GitHub Actions CI: validates that adapters stay in sync when `AGENTS.md` changes
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

Focus areas: stack-specific shortcuts for other tech stacks, new examples, additional hosts, installer improvements.

---

## License

MIT — see [LICENSE](./LICENSE).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

Original ponytail concept by [DietrichGebert](https://github.com/DietrichGebert/ponytail).
Lexis ecosystem by [@nitdraig](https://github.com/nitdraig).
