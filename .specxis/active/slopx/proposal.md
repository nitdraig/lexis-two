# Proposal: slopx

## Goal
One command, `/slopx`, keeps a change from looking or reading like default AI output: code leftovers, generic or inflated copy, and a generic look. It is also the full gate: it always runs its own three passes plus the `desx` design-quality pass, whatever the request was, every finding comes with a suggestion, and the same rules can warn the agent right after it edits a file.

## Lazy Check
- Does this need to exist? Yes. `/desx` improves design quality, `/lexis review` covers rule breaks, and nothing covers what makes output feel generic: code leftovers, copy, and default-looking UI. Users should not have to remember three commands, and the agent forgets too, so `/slopx` also runs `desx`.
- Does stdlib, the framework, or an installed dep already cover it? `git diff` and Node cover the scan. The base design checks already exist in `scripts/desx-audit.js` (fix-desx, done); slopx calls them and extends them instead of copying. ESLint covers a few code leftovers only where configured. No new dependency.
- What is the absolute minimum? One stdlib script (code and copy rules, a registry, waivers, outputs), a call into the desx detector for design, new design rules added to that detector, one orchestrating skill, thin command wrappers, and a small opt-in hook script. Stdout only: no report file, no auto-fix.

## Discovery source
- Path: N/A (scoped feature, modeled on `/desx`)

## Context
- Research source: [Impeccable](https://github.com/pbakaus/impeccable) (Apache 2.0). Read through fetched pages, not its Rust source:
  - the rule catalog on [impeccable.style/anti-patterns](https://impeccable.style/anti-patterns) (67 entries in 9 groups: design system 4, visual details 8, typography 13, color and contrast 7, layout and space 12, motion 4, copy 5, imagery 4, general quality 10);
  - `docs/CLI-CONTRACT.md`: exit codes 0 clean, 1 error, 2 findings; flags `--json --quiet --github --list-rules --no-config --no-inline-ignores --no-advisory`; JSON fields `antipattern, name, description, severity, category, file, line, snippet`; config keys `ignoreRules, ignoreFiles, ignoreValues{rule,value,files,reason}, extensions, advisoryRules`; inline waivers `disable`, `disable-line`, `disable-next-line` with comma-separated ids or `*`;
  - `docs/ENGINE.md`: rule registry rows (`id, name, category, description`, optional `severity: advisory`), tests that pin output byte for byte;
  - `docs/STYLE.md`: banned vocabulary, openers, closers, transitions, em dash, negation pivot, hedges, and the competitor-swap test;
  - `skill/reference/{clarify,craft-floor,hooks}.md`: UX-copy rules, the visual bans, and the hook design (per-edit mechanical tier, deferred judgment tier, never blocks, narrow ignores with a reason).
- Verified separately in the Claude Code hooks documentation: a PostToolUse hook can return `hookSpecificOutput.additionalContext` to add context without blocking, the matcher `Edit|Write|MultiEdit` is an exact list, and plugin hooks live in `hooks/hooks.json`. Not verified: the exact Stop-hook output and the `stop_hook_active` field (the page was cut off), so the Stop pass stays an open question.
- Not borrowed: the Rust/WASM engine, the browser extension, telemetry, the live-variant mode, `DESIGN.md`-based drift rules, and every rule that needs a rendered page. Ideas only, no code or text copied.
- Earlier research for code and copy tells (Beagle `llm-artifacts-detection`, SBC ENIAC and arXiv 2401.14176 on code smells, Vale-style rulesets) still applies. None gives hit rates for comments or dead code, so thresholds are ours and are calibrated.
- Registration points found by grepping `desx`: `commands/`, `.opencode/commands/`, `pi-extension/index.js`, `scripts/install.js` (command filter), `AGENTS.md` plus its four static copies, `README.md`, `site/src/i18n/{en,es}.ts`.
- Boundaries (the full table is in the spec):
  - `/desx` improves design: consistency with the project's own system, hierarchy, accessibility, readability. It compares against that system and against WCAG, writes `DESIGN-AUDIT.md`, and has `/desx apply`. It keeps its exit code 0 default and gains only objective quality rules (`desx/*`).
  - `/slopx` avoids the generic: it compares against a catalog of tells in code, copy and look (`code/*`, `copy/*`, `look/*`). Taste rules are advisory and a brand can waive them. Stdout only.
  - Test for a new rule: a defect even when a person made it goes to `desx`; a default-looking choice a brand could make on purpose goes to `slopx`.
  - `/slopx` runs `desx` as a sub-skill and shows two groups, "Generic" and "Design quality". Ownership is disjoint, so nothing is reported twice.
  - `/lexis review`: rule violations in the diff. Slopx points to it.
  - Impeccable (optional): applies design and copy fixes. Slopx never requires it.
- Scope default: files changed in the working tree plus untracked files; `--all` scans everything. `look` and `quality` findings are file-level (the detector reads whole files).

## Decisions (assumed, change if wrong)
- Reimplement with our own lists and wording; cite Impeccable in `docs/slopx.md`. No copied text, so no Apache 2.0 notice is needed.
- Markdown prose lint is opt-in (`--prose`): this repo's own docs would trip it.
- "Verify everything" means all three passes run on every invocation; there is no flag to pick one. It does not mean the whole repository by default.
- Exit codes follow Impeccable's contract (0 clean, 1 error, 2 findings) because slopx is a detector used in CI as well as by agents. `/desx` keeps its own exit 0 default since it writes a report.
- Severity uses Impeccable's words: `warning` (objective or unfinished work) and `advisory` (taste or heuristic, dropped by `--no-advisory`, never decides the exit code).
- `desx` is repositioned from "visual slop + design-system drift" to design quality, and `slopx` takes the slop framing. That is a wording change in the places the spec lists, not a behavior change in `desx`.
- `desx/nested-cards` stays in `desx` (it hurts hierarchy whoever wrote it), which also leaves the closed `fix-desx` spec untouched.
- The hook is delivered as a documented settings snippet plus a script, not as an entry in the plugin's `hooks/hooks.json`, so no user pays a process start per edit until they opt in.

## Out of Scope (YAGNI)
- Auto-fix or `/slopx apply`. Fixes are applied by the user, `/desx apply`, or Impeccable.
- A report file. Output goes to stdout.
- A Stop-time deep pass (open question below).
- Code checks for languages other than JS/TS in v1. Copy and design checks run on UI and text files regardless of backend language.
- Detecting duplicated blocks, needless defensive checks, and generic copy in the script; the skill asks the model.
- Abstraction, dependency, size, test and type checks: `/lexis review` owns them.
- Rules that need a rendered page (rendered contrast, overflow, clipped menus, orphan words) and `DESIGN.md`-style drift rules (a token allowlist is a MAY, owned by `desx`).
- Changing what `/desx` does beyond the new `desx/*` quality rules and its description.
- Any claim that code or text "was written by AI". The tool flags patterns, not authorship.

## Open Questions
- Command name: `/slopx` (default) or `/lexis slop`.
- Stop pass: Impeccable runs a deeper pass when the session ends. In Claude Code a Stop hook that returns feedback makes the agent keep working, so it needs a loop guard and a check of the exact contract. Decide after reading the Stop section of the hooks documentation.
- Impeccable handoff syntax differs per host (`/impeccable <command>`, `$impeccable` on Codex); the spec emits the command name only.
- Whether to ship the hook entry in `hooks/hooks.json` later, once the cost of an idle process start is measured in calibration.
