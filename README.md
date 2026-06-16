<p align="center">
  <picture>
  <!--  <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.png"> -->
    <img src="assets/logo.png" width="220" alt="Lexis-two, the lazy senior dev">
  </picture>
</p>

<h1 align="center">Lexis-two</h1>

<p align="center">
  <em>The AI agent ecosystem that thinks like the laziest senior dev in the room.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/nitdraig/ponytail?style=flat-square&color=111111&label=stars" alt="Stars">
  <img src="https://img.shields.io/github/v/release/nitdraig/ponytail?style=flat-square&color=111111&label=release" alt="Release">
  <img src="https://img.shields.io/badge/works%20with-13%20agents-111111?style=flat-square" alt="Works with 13 agents">
  <img src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" alt="MIT license">
</p>

<p align="center">
  <strong>80-94% less code &middot; 3-6&times; faster &middot; 47-77% cheaper</strong><br>
  <sub>Median of 10 runs across Haiku, Sonnet, and Opus. <a href="benchmarks/">Reproduce it yourself.</a></sub>
</p>

Built on top of [OpenCode](https://opencode.ai) and [Cursor](https://cursor.sh).
Forked and extended from [ponytail](https://github.com/DietrichGebert/ponytail) by DietrichGebert (MIT).

---

## What is Lexis?

Lexis is a multi-agent ecosystem designed for building premium SaaS products efficiently. It enforces a simple philosophy: **the best code is the code never written**.

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
`cp ~/lexis-two/.cursor/rules/lexis-two.mdc ~/.cursor/rules/lexis-two.mdc`
```

---

## Commands

Once installed, these slash commands are available in OpenCode:

| Command               | What it does                                                     |
| --------------------- | ---------------------------------------------------------------- |
| `/lexis-two-review`   | Reviews recent changes against AGENTS.md rules                   |
| `/lexis-two-audit`    | Full codebase audit — over-engineering, deps, structure          |
| `/lexis-two-debt`     | Surfaces all `// lexis:` comments as prioritized debt list       |
| `/lexis-two-plan`     | Plans a feature using the lazy decision hierarchy before coding  |
| `/lexis-two-security` | Security audit focused on your stack (Node.js, MongoDB, Next.js) |

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

## Adapting Lexis-Two to Any Stack

Lexis-Two is highly portable and can be adapted to any programming language, framework, or database stack. To customize it for your team's stack, follow these three steps:

### 1. Update the Steering Rules (`AGENTS.md`)

The canonical source of truth for your agent's behavior is `AGENTS.md`. Open it and replace the **Stack-Specific Shortcuts** section with rules tailored to your technology.

- **For Python / Django / FastAPI**: Enforce standard library features (like `functools.lru_cache` or `dataclasses`), native type hints, and built-in SQLite/PostgreSQL patterns.
- **For Rust**: Enforce standard library traits, `Option`/`Result` patterns, and specific crate guidelines (e.g., `tokio` for async, `serde` for serialization).
- **For Go**: Enforce built-in concurrency primitives (channels, goroutines), standard library HTTP routing, and table-driven testing.

Once you update `AGENTS.md`, run the integrity check script to automatically synchronize all static rule copies for IDE hosts:

```bash
node scripts/check-rule-copies.js
```

_(If it fails, copy the updated body of `AGENTS.md` into `.cursor/rules/lexis-two.mdc`, `.windsurf/rules/lexis-two.md`, `.clinerules/lexis-two.md`, and `.kiro/steering/lexis-two.md`, preserving their frontmatter)._

### 2. Customize Portable Skills (`skills/`)

Each portable skill in `skills/` can be adapted to run your stack's specific CLI tools:

- **Security Audit (`skills/lexis-two-security/SKILL.md`)**: Change the automated commands to match your stack. For example, use `cargo audit` for Rust, `pip-audit` for Python, or `gosec` for Go instead of `npm audit`.
- **Codebase Audit (`skills/lexis-two-audit/SKILL.md`)**: Change `depcheck` or linter commands to tools like `pylint`, `clippy`, or `golangci-lint`.
- **Technical Debt (`skills/lexis-two-debt/SKILL.md`)**: Adjust file extensions in the `grep` command to match your language (e.g., `--include="*.py"` or `--include="*.rs"`).

### 3. Update Host Commands (`commands/` and `.opencode/`)

If you change the commands or tools in the skills, make sure to update:

- The description and prompt fields in the Gemini CLI TOML files (`commands/*.toml`).
- The description and instructions in the OpenCode Markdown commands (`.opencode/command/*.md`).

---

## Complementary Repos

| Repo                                               | What it adds                                                        |
| -------------------------------------------------- | ------------------------------------------------------------------- |
| [my-skills](https://github.com/nitdraig/my-skills) | OpenCode/Cursor skills: code review, testing, security, performance |

---

## Roadmap

- [x] v0.1 — Core AGENTS.md + plugin + commands + modes
- [ ] v0.2 — Agent ecosystem documentation + project AGENTS.md template
- [x] v0.3 — Lexis-Two: next evolution beyond IDE/CLI agents
- [ ] v0.4 — Lexis-Core: orchestrator agent for complex multi-agent workflows

---

## Contributing

Contributions welcome. Before opening a PR, read `AGENTS.md` — it applies here too.

Focus areas: stack-specific shortcuts for other tech stacks, new modes, additional commands.

---

## License

MIT — see [LICENSE](./LICENSE).

Original ponytail concept by [DietrichGebert](https://github.com/DietrichGebert/ponytail).
Lexis ecosystem by [@nitdraig](https://github.com/nitdraig).
