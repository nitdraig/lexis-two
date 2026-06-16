<p align="center">
  <picture>
  <!--  <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.png"> -->
    <img src="assets/logo.png" width="220" alt="Lexis-two">
  </picture>
</p>

<h1 align="center">Lexis-two</h1>

<p align="center">
  <em>The simple way to obtain the best code.</em><br>
  <small>Portable rules, skills, and slash commands for AI agents. The simple way to get the best code. With lowest tokens usage.</small>
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/nitdraig/lexis-two?style=flat-square&color=111111&label=stars" alt="Stars">
  <img src="https://img.shields.io/github/v/release/nitdraig/lexis-two?style=flat-square&color=111111&label=release" alt="Release">
  <img src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" alt="MIT license">
</p>

<p align="center">
  <sub>Benchmark harness inherited from <a href="benchmarks/">ponytail</a>; Lexis-Two-specific runs pending.</sub>
</p>

---

Built on top of [OpenCode](https://opencode.ai) and [Cursor](https://cursor.sh).
Forked and extended from [ponytail](https://github.com/DietrichGebert/ponytail) by DietrichGebert (MIT).

---

## What is Lexis?

Lexis is a multi-agent ecosystem designed for building premium web apps products efficiently. It enforces a simple philosophy: **the best code is the code never written**.

Rather than a single AI assistant, Lexis is a team of specialized agents — each with a defined role, model, and scope — coordinated to cover the full development lifecycle: planning, coding, refactoring, reviewing, and security auditing.

### The Agents

| Agent              | Role                 | Scope                                |
| ------------------ | -------------------- | ------------------------------------ |
| `lexis-one`        | Primary coding agent | Implements, edits, runs bash         |
| `lexis-review`     | Strategic reviewer   | Evaluates changes, never edits       |
| `ui-architect`     | UX/UI architect      | Consults on design, never implements |
| `refactor-agent`   | Refactor specialist  | Large-scale code restructuring       |
| `security-auditor` | Security analyst     | Read-only, runs audit tools          |
| `explorer`         | Codebase mapper      | Read-only, fast local model          |

### The Philosophy

Before writing any code, Lexis stops at the first rung that holds:

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

### OpenCode

```bash
# Clone the repo
git clone https://github.com/nitdraig/lexis-two.git ~/lexis-two
```

Add to your `opencode.json`:

```jsonc
{
  "plugin": ["~/lexis-two/.opencode/plugins/lexis-two.mjs"],
  "instructions": ["~/lexis-two/AGENTS.md"],
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

Once installed, these slash commands are available in OpenCode:

| Command               | What it does                                                          |
| --------------------- | --------------------------------------------------------------------- |
| `/lexis-two-review`   | Reviews recent changes against AGENTS.md rules                        |
| `/lexis-two-audit`    | Full codebase audit — over-engineering, deps, structure               |
| `/lexis-two-debt`     | Surfaces all `// lexis:` comments as prioritized debt list            |
| `/lexis-two-plan`     | Plans a feature using the minimalist decision hierarchy before coding |
| `/lexis-two-security` | Security audit focused on your stack (Node.js, MongoDB, Next.js)      |

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

Run `/lexis-two-debt` to collect and prioritize all tagged items across the codebase.

---

## Complementary Repos

| Repo                                               | What it adds                                                        |
| -------------------------------------------------- | ------------------------------------------------------------------- |
| [my-skills](https://github.com/nitdraig/my-skills) | OpenCode/Cursor skills: code review, testing, security, performance |

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
- [ ] `docs/setup.md` — detailed installation guide per host
- [ ] `docs/modes.md` — when to use lite / full / ultra and how to create custom modes
- [ ] `npx lexis-two install` — setup script that detects the host (cursor, windsurf, opencode…) and copies the right files
- [ ] README improvements with real `// lexis:` comment examples showing before/after simplifications

---

### v0.3 — Multi-host Maturity

Full, verified support across all major hosts.

- [ ] Claude Code adapter (`.claude-plugin/` + `hooks/`) — scaffold in repo
- [ ] GitHub Copilot IDE plugin (`.github/plugin/`) — scaffold in repo
- [ ] Codex adapter (`.codex-plugin/plugin.json` + `hooks/hooks.json`)
- [ ] pi adapter (`pi-extension/`)
- [ ] Verified skills working in Gemini CLI, Codex, and pi
- [ ] `examples/` — real before/after cases with `// lexis:` comments across the stack (Next.js, Express, MongoDB, PostgreSQL)
- [ ] `docs/contributing.md` — how to add a new adapter or skill

---

### v0.4 — Lexis-Core (Public Orchestrator)

The public orchestrator — a generalized pattern extracted from the private Lexis-One ecosystem.

- [ ] Public documentation of the multi-agent role architecture (without exposing private config)
- [ ] Guide: how to build a multi-agent ecosystem using Lexis-Two as the base
- [ ] `lexis-core` as a reference agent in the docs — prompts and patterns, not private implementation
- [ ] Guide: "How to build your own private Lexis-One on top of Lexis-Two"
- [ ] `opencode.json` template with the full agent ecosystem (no keys, placeholders only)

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

Contributions welcome. Before opening a PR, read `AGENTS.md` — it applies here too.

Focus areas: stack-specific shortcuts for other tech stacks, new modes, additional commands.

---

## License

MIT — see [LICENSE](./LICENSE).

Original ponytail concept by [DietrichGebert](https://github.com/DietrichGebert/ponytail).
Lexis ecosystem by [@nitdraig](https://github.com/nitdraig).
