# Lexis-Two Maturity Strategy

> Roadmap for the three remaining adoption blockers: installer, examples, and contributor docs.
> Part of [Excelso Open](https://excelso.xyz). See [portability.md](./portability.md) for current host support.

This document is the execution plan — not a wish list. Each section defines scope, deliverables, acceptance criteria, and what we intentionally skip.

---

## Overview

| Initiative | Goal | Roadmap bucket | Priority |
| ---------- | ---- | -------------- | -------- |
| **A. `npx @draig/lexis-two install`** | Zero-friction setup for any host | v0.2 — Developer Experience | P0 |
| **B. `examples/`** | Prove the philosophy with real before/after code | v0.3 — Multi-host Maturity | P1 |
| **C. `CONTRIBUTING.md`** | Enable community adapters and skills | v0.3 — Multi-host Maturity | P1 |

**Recommended order:** A → B → C. The installer removes the biggest friction today. Examples give contributors something concrete to reference. Contributing docs close the loop for Excelso Open.

---

## A. Interactive global installer (`npx @draig/lexis-two install`)

### Problem

Today users must clone the repo and manually copy files into host-specific paths (`.cursor/rules/`, `.windsurf/rules/`, `opencode.json`, etc.). That works for early adopters but blocks mainstream adoption.

### Goal

One command that detects installed tools, asks what to configure, and writes the minimum files — idempotently and reversibly.

### Non-goals (YAGNI)

- No GUI installer.
- No auto-update of already-customized `AGENTS.md` (offer merge hint only).
- No dependency on external CLIs beyond Node.js.
- No Windows registry / macOS LaunchAgent magic.

### Deliverables

| File | Purpose |
| ---- | ------- |
| `scripts/install.js` | Main interactive installer (stdin prompts or `@clack/prompts` only if already in deps — prefer zero deps) |
| `package.json` → `"bin"` | Expose `lexis-two` binary pointing at `scripts/install.js` |
| `docs/setup.md` | Per-host install reference (generated from installer logic, not duplicated by hand) |
| `tests/install.test.js` | Dry-run mode + fixture dirs; no real home directory writes in CI |

### Host detection matrix

| Host | Detect | Project install | Global install |
| ---- | ------ | --------------- | -------------- |
| **Cursor** | `.cursor/` exists or `cursor` in PATH | Copy `.cursor/rules/lexis-two.mdc` | Copy to `~/.cursor/rules/` |
| **Windsurf** | `.windsurf/` or Windsurf config dir | Copy `.windsurf/rules/lexis-two.md` | N/A (project-only today) |
| **Cline** | `.clinerules/` | Copy `.clinerules/lexis-two.md` | N/A |
| **Kiro** | `.kiro/` | Copy `.kiro/steering/lexis-two.md` | N/A |
| **OpenCode** | `opencode.json` or `~/.config/opencode/` | Merge `plugin` + `instructions` keys | Same, global config path |
| **Claude Code** | `~/.claude/` or `CLAUDE_CONFIG_DIR` | Point plugin at npm path or local clone | Plugin marketplace hint only |
| **Gemini CLI** | `gemini-extension.json` discoverable | Print `cd` + install steps | N/A |
| **pi** | `pi` in PATH | `pi install` hint | N/A |
| **Copilot (repo)** | `.github/` | Copy `.github/copilot-instructions.md` | N/A |
| **Generic** | Always offered | Copy `AGENTS.md` to project root (with confirm) | Copy to `~/.copilot/` or `~/.codex/` if user picks |

Detection should be **heuristic, not exhaustive**: check config dirs and common CLI names. When uncertain, ask.

### UX flow

```
npx @draig/lexis-two install
  │
  ├─► Scan: project root + home config dirs
  ├─► Show detected hosts (checkboxes, pre-selected)
  ├─► Ask: project / global / both
  ├─► Dry-run summary (files to create/merge)
  ├─► Confirm
  └─► Write + print next steps (/lexis status, /specxis status)
```

**Flags (non-interactive CI / power users):**

```bash
npx @draig/lexis-two install --host cursor,opencode --scope project --yes
npx @draig/lexis-two install --dry-run
npx @draig/lexis-two install --uninstall --host cursor
```

### Implementation phases

1. **Phase A1 — Rules-only hosts** (Cursor, Windsurf, Cline, Kiro, `AGENTS.md` copy). Lowest risk, highest value.
2. **Phase A2 — OpenCode** (merge `opencode.json` without clobbering existing `plugin` array).
3. **Phase A3 — Uninstall + dry-run** (`--uninstall`, backup `.bak` suffix on overwrite).
4. **Phase A4 — Hints for plugin hosts** (Claude, Copilot, Gemini) where full automation is blocked by marketplace install.

### Acceptance criteria

- [ ] `npx @draig/lexis-two install` works on Windows, macOS, Linux without bash.
- [ ] Re-running installer is idempotent (same result, no duplicates).
- [ ] `--dry-run` prints exact file operations; CI test asserts them.
- [ ] `package.json` `files` includes `scripts/install.js` and bin entry.
- [ ] README install section links to `docs/setup.md` and shows one-liner.

### Risks

| Risk | Mitigation |
| ---- | ---------- |
| Overwriting user `AGENTS.md` | Never overwrite without `--force`; default to skip or side-by-side `AGENTS.lexis.md` |
| Broken `opencode.json` merge | JSON parse + validate; backup before write |
| npm bin name collision | Use `@draig/lexis-two` scope; bin name `lexis-two` |

---

## B. Real refactoring examples (`examples/`)

### Problem

Developers adopt tools they can *see* working. Lexis philosophy is abstract until shown on real code: over-engineered auth middleware, unnecessary React abstractions, redundant MongoDB layers.

### Goal

A small, curated `examples/` tree where every case is a believable mistake and a minimal fix — with `// lexis:` comments explaining *why*.

### Non-goals

- No runnable full apps (snippets only).
- No framework rewrites (Next 13 → 15 migrations, etc.).
- No more than **3 stacks** in v1 of examples (scope control).

### Directory structure

```
examples/
├── README.md                 # Index + how to read examples
├── nextjs/
│   ├── 01-modal-library/
│   │   ├── before.tsx
│   │   ├── after.tsx
│   │   └── README.md         # Context, LOC delta, lexis tags used
│   ├── 02-client-fetch-wrapper/
│   └── 03-form-validation-zoo/
├── express/
│   ├── 01-auth-middleware-stack/
│   ├── 02-error-handler-factory/
│   └── 03-pagination-abstraction/
├── fastapi/
│   ├── 01-pydantic-overkill/
│   ├── 02-custom-cache-layer/
│   └── 03-dependency-injection-maze/
└── shared/
    └── lexis-comment-patterns.md   # Canonical // lexis: tag reference
```

**Target:** 9 examples (3 per stack), each under ~80 lines per file.

### Example quality bar

Every example must include:

1. **Before** — realistic code a mid-level dev would write under time pressure.
2. **After** — smallest correct implementation (stdlib, native APIs, existing deps).
3. **`// lexis:` comments** — at least one per after-file, tagged (`simplified`, `skipping abstraction`, `tech debt`, etc.).
4. **README.md** — 5-line summary: problem, YAGNI rung that applied, LOC before/after, related `/lexis` command (`review`, `audit`, `debt`).

### Example themes (prioritized)

| Stack | Theme | YAGNI rung |
| ----- | ----- | ---------- |
| Next.js | Modal library vs `<dialog>` | Native platform |
| Next.js | `useEffect` fetch vs Server Component | Existing stack feature |
| Next.js | Zod + RHF for 2 fields vs HTML5 | Stdlib / HTML first |
| Express | 4-layer auth middleware vs one function | Deletion over addition |
| Express | Custom `AppError` hierarchy vs `status + message` | No abstraction until third use |
| Express | Generic pagination class vs query params | Follow existing pattern |
| FastAPI | 3 Pydantic models for one endpoint vs one | One line if possible |
| FastAPI | Redis cache for single-user tool vs in-memory | Map before Redis |
| FastAPI | DI container for 2 services vs plain imports | KISS |

### Integration points

- Link from main `README.md` philosophy section (1–2 inline examples).
- Landing page `Example.astro` — pick the strongest Next.js modal case.
- `/lexis review` skill — reference `examples/` in SKILL.md as calibration material.
- Benchmark narrative — optional LOC comparison table in `examples/README.md`.

### Implementation phases

1. **Phase B1** — `examples/README.md` + `shared/lexis-comment-patterns.md` + 1 gold-standard example (Next.js modal).
2. **Phase B2** — Remaining Next.js + Express examples.
3. **Phase B3** — FastAPI examples + landing/README links.

### Acceptance criteria

- [x] `examples/README.md` indexes all cases with LOC counts.
- [ ] Every `after.*` file compiles / type-checks (optional `examples/tsconfig.json` for TS only).
- [x] No new runtime dependencies introduced by examples.
- [x] Roadmap checkbox in README v0.3 marked done.

---

## C. Contributor documentation (`CONTRIBUTING.md`)

### Problem

Excelso Open invites collaboration, but without a contract contributors will duplicate logic in adapters, fork skills per host, or break version sync across manifests.

### Goal

A single `CONTRIBUTING.md` at repo root that explains the architecture, the rules of thin adapters, and the exact checklist for adding a host, skill, or command.

### Non-goals

- No CODE_OF_CONDUCT duplicate (link to Excelso Open policy if needed).
- No lengthy style guide (point to `AGENTS.md`).
- No governance model essay (keep under ~200 lines).

### Document outline

```markdown
CONTRIBUTING.md
├── Philosophy (link AGENTS.md — lazy senior dev)
├── Architecture
│   ├── skills/ = source of truth
│   ├── commands/ + .opencode/commands/ = thin dispatchers
│   ├── hooks/ = lifecycle (shared across Claude, Codex, Copilot)
│   └── instruction-tier copies (Cursor, Windsurf, Cline, Kiro)
├── Adding a new host adapter
│   ├── Decision tree: full plugin vs rules-only
│   ├── Files to create
│   └── Tests to add (gemini-extension.test.js pattern)
├── Adding a new skill
│   ├── skills/<name>/SKILL.md structure
│   ├── Register in pi-extension, commands/*.toml, .opencode/commands/
│   └── Subcommand under /lexis or /specxis (not a new top-level slash)
├── Adding a new command
│   ├── Prefer subcommands: /lexis <action>, /specxis <action>
│   ├── Deprecation path for old names
│   └── Update tests/command-sync.test.js expectations
├── Version sync checklist
│   └── package.json, gemini-extension.json, .claude-plugin/, .codex-plugin/, .github/plugin/
├── PR checklist
│   ├── npm test
│   ├── node scripts/check-rule-copies.js (if AGENTS.md touched)
│   └── docs/portability.md host table updated
└── Contact / Excelso Open link
```

### Key rules to encode

1. **Adapters point, they don't implement.** If logic appears in two hosts, it belongs in `skills/` or `hooks/`.
2. **One command entry point per domain.** `/lexis` and `/specxis` — not `/lexis-two-audit-v2`.
3. **Instruction-tier hosts stay synced.** Edit `AGENTS.md`, then run `check-rule-copies.js`.
4. **Manifest versions move together.** Bump all plugin JSON files in the same commit.
5. **Tests are the contract.** If a file ships in `commands/`, a test must assert it exists for every registered host.

### Implementation phases

1. **Phase C1** — `CONTRIBUTING.md` skeleton + architecture section (can ship immediately).
2. **Phase C2** — Host/skill/command how-tos with copy-paste templates.
3. **Phase C3** — PR checklist wired into `.github/pull_request_template.md` (optional, 10 lines).

### Acceptance criteria

- [x] `CONTRIBUTING.md` exists at repo root.
- [x] README links to it under a "Contributing" heading.
- [x] `docs/portability.md` links to it from the adapter rule section.
- [ ] New contributor can add a rules-only host by following the doc alone.
- [x] Roadmap checkbox for `docs/contributing.md` marked done.

---

## Cross-cutting concerns

### Testing strategy

| Initiative | Test type |
| ---------- | --------- |
| Installer | Unit tests with temp dirs; `--dry-run` output snapshots |
| Examples | Optional: `node scripts/lint-examples.js` — max LOC, required `// lexis:` |
| Contributing | No automated test; validated by first external PR |

### Release alignment

Ship all three in **v1.0.10** (installer alpha) → **v1.1.0** (examples + CONTRIBUTING complete). Installer can land independently as minor if examples are not ready.

### Documentation map (target state)

```
README.md              → quick start + link to strategy
docs/strategy.md       → this file (execution plan)
docs/setup.md          → per-host install (feeds from installer)
docs/portability.md    → host matrix (source of truth)
docs/specxis.md        → SDD workflow
CONTRIBUTING.md        → how to extend the ecosystem
examples/README.md     → before/after catalog
```

### Success metrics

| Metric | Target (90 days post-ship) |
| ------ | -------------------------- |
| Install command usage | Track via npm download spikes after README update |
| Time-to-first-`/lexis` | < 5 minutes from `npx install` (user-reported) |
| External PRs | ≥ 1 adapter or skill PR from non-maintainer |
| Example engagement | Linked from landing; referenced in issues |

---

## Immediate next actions

1. **A1** — Create `scripts/install.js` with Cursor + `AGENTS.md` copy only; add `bin` to `package.json`.
2. **B1** — Create `examples/nextjs/01-modal-library/` as the reference example.
3. **C1** — Draft `CONTRIBUTING.md` architecture section (can parallelize with B1).

Do not start v0.4 (Lexis-Core orchestrator) until A + B + C acceptance criteria are met. Adoption tooling compounds; orchestration docs do not.

---

_Maintained as part of Lexis-Two / Excelso Open. Update this file when scope or priority changes._
