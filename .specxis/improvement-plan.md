# Improvement plan

Source: full-project review of v1.4.0 (2026-11-03). Baseline: 87 tests green, site builds, `npm audit` clean.

The findings exceed the Rule of 10, so they are split into independent specs. `fix-distribution` is in progress; the rest are `draft` until agreed.

## Execution order

| # | Spec | Why this position | Tasks | Findings |
|---|------|-------------------|-------|----------|
| 1 | [fix-distribution](./active/fix-distribution/spec.md) | Broken install channels and a false-green test | 10 | F1-F6 |
| 2 | [fix-mode-state](./active/fix-mode-state/spec.md) | Core behavior: the active mode is lost constantly | 10 | B1-B9, S9 |
| 3 | [fix-installer-safety](./active/fix-installer-safety/spec.md) | Data loss and writes to the wrong place | 7 | B11, B13-B15, M8a |
| 4 | [fix-specx](./active/fix-specx/spec.md) | Lifecycle never writes status, review diff empties after a commit, debt ledger overwritten | 6 | X1-X10, B10, M3a, M3b, M8b, S14 |
| 5 | [fix-desx](./active/fix-desx/spec.md) | False findings, `--json` writes, `--git` misses files, resolved churn | 6 | D1-D12, B12, B16-B18, M7 |
| 6 | [ci-and-housekeeping](./active/ci-and-housekeeping/spec.md) | Guards the fixes above against regressions | 7 | M2, M4, M5, M6, M8b (site), S16 |
| 7 | [installer-upgrade](./active/installer-upgrade/spec.md) | Design change; needs spec 3 merged first | 6 | M1 |
| 8 | [simplify-codebase](./active/simplify-codebase/spec.md) | Refactors go last, on top of tests and CI | 10 | S1-S8, S10, S11, S13, S15 |

`fix-audit-scripts` is superseded by specs 4 and 5 (one spec per skill) and stays only as a record. The X and D findings come from [audit-specx-desx-slopx.md](./audit-specx-desx-slopx.md).

Separate from the review findings: [slopx](./active/slopx/spec.md) (new feature: the anti-generic gate: code, copy and look rules, plus the desx quality pass, with an opt-in hook, 9 tasks, draft). Specs 1 to 5 already landed, so nothing blocks it.

Specs 1-5 are independent of each other. Spec 6 can move earlier if CI protection is wanted sooner.

## Decisions (resolved 2026-11-03)

| # | Question | Decision | Affects |
|---|----------|----------|---------|
| D1 | Should the public package force Spanish? | No, and the language must be configurable: `LEXIS_TWO_LANGUAGE` or `language` in the config file, defaulting to the user's language. | fix-distribution |
| D2 | Should `/lexis review` persist as a mode? | No. One-shot, like `/lexis plan`. | fix-mode-state |
| D3 | Should an install without TTY and without `--yes` fail? | Yes, as the help text promises. Needs a CHANGELOG entry. | fix-installer-safety |
| D4 | Delete `plans/`? | Yes. Approved, not yet done: the deletion was blocked by a permission rule, so the maintainer runs it. | ci-and-housekeeping |

## Traceability

### Failures

| ID | Finding | Spec / task |
|----|---------|-------------|
| F1 | `.claude-plugin/plugin.json` fails validation | fix-distribution 003, 004 |
| F2 | Postinstall never patches; its test is a false green | fix-distribution 001, 002 |
| F3 | `lexis-two-debt` frontmatter does not parse; grep only covers `src` | fix-distribution 005 |
| F4 | Public ruleset forces Spanish; language not configurable | fix-distribution 006, 007, 010 |
| F5 | Installer hints reference files not in the tarball | fix-distribution 008, 009 |
| F6 | `AGENTS.md` references files not copied to the project | fix-distribution 006 |

### Bugs

| ID | Finding | Spec / task |
|----|---------|-------------|
| B1 | Any `/lexis` subcommand resets the mode | fix-mode-state 001 |
| B2 | Resume and compaction reset the mode | fix-mode-state 004 |
| B3 | `/lexis ultra` may leave the model without the definition | fix-mode-state 003 |
| B4 | `/lexis review` sticks | fix-mode-state 001, 007 |
| B5 | Mentioning "normal mode" turns Lexis off | fix-mode-state 002, 008 |
| B6 | Copilot receives the Claude statusline nudge | fix-mode-state 005 |
| B7 | Inconsistent state paths | fix-mode-state 006, 007 |
| B8 | pi routes to a nonexistent help skill | fix-mode-state 009 |
| B9 | pi `/lexis-two` uses undocumented `pi.commands` | fix-mode-state 010 |
| B10 | `specxis-debt` destroys ticks and notes; substring classifier; crashes on broken symlink | fix-specx 001 |
| B11 | Second `--force` overwrites the original backup | fix-installer-safety 001 |
| B12 | `desx-audit` arguments are not validated | fix-desx 001 |
| B13 | Uninstalling one host removes shared `stacks/` | fix-installer-safety 002 |
| B14 | `--scope global` writes to the project | fix-installer-safety 003, 004 |
| B15 | No TTY installs without `--yes` | fix-installer-safety 005 |
| B16 | `desx --git` marks unscanned findings as resolved | fix-desx 002 |
| B17 | Contrast pairs unrelated colors | fix-desx 003 |
| B18 | CSS selectors read as colors | fix-desx 003 |

### Improvements

| ID | Finding | Spec / task |
|----|---------|-------------|
| M1 | No upgrade path for installed files | installer-upgrade (all) |
| M2 | CI lacks lint, site build, Windows, permissions, plugin validation | ci-and-housekeeping 001, 002 |
| M3a | `specxis-debt` untestable and untested | fix-specx 001 |
| M3b | `specxis-init` untested | fix-specx 002 |
| M4 | All five `plans/` remain open | ci-and-housekeeping 007 |
| M5 | `package.json` metadata; `pi-extension/package.json` not published | ci-and-housekeeping 003 |
| M6 | OpenCode silently skips local models | ci-and-housekeeping 004 |
| M7 | `desx-audit` always exits 0; mixed-language report | fix-desx 001, 005 |
| M8a | `stacks/_template.md` copied to user projects | fix-installer-safety 006 |
| M8b | `site/public/redesing/` published; stale command names | ci-and-housekeeping 005; fix-specx 002, 003 |

### Simplifications

| ID | Finding | Spec / task |
|----|---------|-------------|
| S1 | `bin/lexis-two.js` shim | simplify-codebase 001 |
| S2 | Unreachable OpenCode fallback `require` | simplify-codebase 002 |
| S3 | Self-referencing devDependency | simplify-codebase 003 |
| S4, S5 | Dead installer branches | simplify-codebase 004 |
| S6 | Duplicated install and uninstall planning | simplify-codebase 005 |
| S7, S8 | Redundant mode normalization | simplify-codebase 006 |
| S9 | `specxis` in the tracker regex | fix-mode-state 001 |
| S10 | `.cursor/skills/` copies | simplify-codebase 007 |
| S11 | Hand-copied host rules | simplify-codebase 008 |
| S12 | Six deprecated skills | Deferred to the next major version (breaking) |
| S13 | Dead pi parsing and compat routes | simplify-codebase 009 |
| S14 | Unused `debtContent` | fix-specx 001 |
| S15 | Dead `desx-audit` constants | simplify-codebase 010 |
| S16 | Duplicate rule check in `test.yml` | ci-and-housekeeping 002 |

## Verification limits of the review

- F1: after the `./` fix, a marketplace add and plugin install in an isolated config (Claude Code 2.1.317) succeed and list 16 skills and 2 hook events, with no duplicate-hooks report. No live session was started, so the hooks were not seen firing.
- `commands/` holds only `.toml` files (Gemini format), so the Claude plugin's `commands` field loads no commands. `/lexis` reaches Claude Code through skills. Not yet assigned to a spec.
- B8, B9: read from code and the official pi docs; not run on a real pi.
- B4 (OpenCode part), B7: read from code.
- Not reviewed in depth: site components, `benchmarks/`, `examples/`, most skill text.
