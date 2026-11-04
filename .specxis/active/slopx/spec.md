# Spec: slopx

> Status: implementing
>
> Amended four times: after the audit ([audit-specx-desx-slopx.md](../../audit-specx-desx-slopx.md), S1 to S14), after the design-pass request, after reading Impeccable's rule catalog and CLI contract, and after the desx/slopx split below. The rule catalog is the contract; tiers say what is mandatory.

## Ownership: desx improves design, slopx avoids the generic

| | `/desx` | `/slopx` |
| --- | --- | --- |
| Question | Is this good design? | Does this look, read or code like default AI output? |
| Compared against | The project's own system (scales, tokens) and objective standards (WCAG) | A catalog of known tells |
| Scope | UI files | Code, text and UI |
| Output | `DESIGN-AUDIT.md` (persistent, checkboxes) and `/desx apply` | Stdout only |
| Weight | Mostly `warning` | Taste rules are `advisory` and a brand can waive them |
| Rule ids | `desx/*` | `code/*`, `copy/*`, `look/*` |

Test for a new rule: if the problem would be a defect even when a person made it (readability, accessibility, consistency with the project's system), it belongs to `desx`. If it is a problem because it is what models emit by default, and a brand could choose it on purpose, it belongs to `slopx`.

`/slopx` stays the full gate. It runs its own three passes (`code`, `copy`, `look`) and also invokes `desx` as a sub-skill for the design-quality pass (`quality`), and shows the two result groups under separate headings, "Generic (slopx)" and "Design quality (desx)". Rule ownership is disjoint, so one problem is never reported twice.

## Requirements

### MUST (non-negotiable)

Entry point and passes
- [x] `node scripts/slopx-audit.js` runs four passes on every invocation, with no flag to pick or skip one: `code`, `copy`, `look` (slopx rules) and `quality` (desx rules, through the desx detector). The report always lists the four with their finding counts, or the reason one had nothing to check ("look and quality: no UI files in scope").
- [x] The `quality` pass runs `runDesxAudit` from `scripts/desx-audit.js` in dry-run and maps its findings into the slopx format. It never writes `DESIGN-AUDIT.md` or any other file.
- [x] The skill invokes `desx` as a sub-skill for the `quality` pass whenever there are UI files in scope, even if the request never mentioned design.
- [x] The `look` rules reuse the CSS and color helpers of `scripts/desx-audit.js` (exported from it); slopx does not carry a second CSS parser.
- [x] Default scope is lines added since `HEAD` (staged and unstaged) plus untracked files; `look` and `quality` findings are file-level. `--all` scans every eligible file. With no commits, the diff is against the empty tree.
- [x] Stdout only. The script never writes, moves or deletes a file, and never runs a build or test command.

Safety
- [x] File lists and hunk headers are read with `-z` and `core.quotepath=false`; carriage returns are stripped.
- [x] Untracked files are read only if regular: symlinks are skipped (`lstat`), files over 1 MB or with a NUL byte are skipped, generated paths are skipped (`dist/`, `build/`, `*.min.*`, `*.d.ts`, lockfiles, `benchmarks/results/`).
- [x] No output, plain or JSON, contains the text of a flagged line (a debug leftover may print a secret). A finding may carry `ignoreValue`, the short token a narrow ignore would name (an emoji, a font name, a phrase).
- [x] `.slopx.json` is data: parsed with `JSON.parse`, never executed; globs cannot reach outside the repository; a malformed file fails with a readable message.

CLI contract (aligned with Impeccable's `detect`)
- [x] Flags: `--json`, `--quiet` (one summary line on stderr), `--github` (Actions annotations: `::warning file=...,line=...,title=...::[id] description`), `--list-rules` (plain, `--quiet` for ids only, or `--json`), `--all`, `--prose`, `--base <ref>`, `--no-advisory`, `--no-config`, `--no-inline-ignores`, `--cwd`, `--help`. `--github` with `--json` or `--list-rules` is an error.
- [x] Exit codes: `0` when there are no warnings (advisory findings may still be listed), `1` for invalid input or a target that could not be scanned (takes precedence), `2` when at least one `warning` finding exists. `--no-advisory` removes advisory findings from the output.
- [x] `--json` prints `{ passes, findings }`; each finding has `id`, `name`, `description`, `severity` (`warning` or `advisory`), `pass`, `category`, `owner` (`slopx` or `desx`), `file`, `line`, `fileLevel`, `suggestion`, `handoff`, and `ignoreValue` when it applies.
- [x] An unknown flag or a non-git directory fails with a clear message and exit 1.

Waivers and config
- [x] Inline waivers `slopx-disable`, `slopx-disable-line` and `slopx-disable-next-line` take comma-separated rule ids or `*` and a mandatory reason after a colon, in `//`, `/* */` or `<!-- -->` form, and work for `desx/*` ids too when the finding is reported through slopx. A waiver without a reason is itself reported (`slopx/waiver-without-reason`). `// lexis:` on a line also exempts it. `--no-inline-ignores` turns waivers off.
- [x] `.slopx.json` (and an optional uncommitted `.slopx.local.json` that overrides it) supports `ignoreRules`, `ignoreFiles` and `ignoreValues` (`rule`, `value`, `files`, `reason`), `extensions` (extra template extensions treated as HTML), and `advisoryRules`. Every ignore needs a `reason`. `--no-config` skips both files.

Rule registry
- [x] Every rule is a row `{ id, name, pass, owner, category, severity, tier, description, suggestion, handoff }` with a stable id `<prefix>/<name>`. `--list-rules` prints the registry without scanning, and `docs/slopx.md` is generated from it. `desx/*` rows are listed by slopx and implemented in the desx detector.
- [x] Tiers: `immediate` rules are mechanical and unambiguous (they also run in the hook, whatever their severity); `deferred` rules are heuristic or taste.

Rule catalog, tier 1 (all mandatory; `W` warning, `A` advisory)

| Id | Detection (source level) | Sev | Tier |
| --- | --- | --- | --- |
| `code/marker` | `TODO FIXME XXX HACK` added in the diff; "rest of the code", "implementation here" | W | immediate |
| `code/debug-leftover` | `debugger` always; `console.log/debug` only if the file has no other `console.*` outside the added lines, no shebang, not under `bin/` or `scripts/` | W | immediate |
| `code/commented-out-code` | 2 or more consecutive `//` lines that read as statements; JSDoc excluded | W | deferred |
| `code/compat-cruft` | `// removed ...`, `// previously ...`; `_old` names are advisory; `_unused` and `@deprecated` never | W | deferred |
| `code/empty-catch` | empty body with no statement and no comment | W | immediate |
| `copy/emoji` | `\p{Emoji_Presentation}` or any character followed by U+FE0F, in any scanned line (not `(c)`, arrows, check marks) | W | immediate |
| `copy/placeholder-text` | `Lorem ipsum`, `Your text here`, `Click here`, `Description goes here`, Spanish equivalents, in UI and i18n files | W | immediate |
| `copy/stock-vocabulary` | seamless, robust, elevate, empower, pivotal, tapestry, delve, "unlock the power", "get started today", "it is worth noting" and Spanish equivalents | A | deferred |
| `copy/generic-claim` | world-class, best-in-class, cutting-edge, state-of-the-art, next-generation, game-changing, revolutionary, blazing fast | A | deferred |
| `copy/filler-framing` | openers and closers ("in today's", "gone are the days", "whether you're", "let's dive in", "in summary", "in conclusion") and the transitions moreover, furthermore | A | deferred |
| `copy/forced-contrast` | "not just X, it's Y", "less about X, more about Y" and Spanish equivalents | A | deferred |
| `copy/em-dash-overuse` | 2 or more em dashes, or a double hyphen used as a dash, in one UI string | A | deferred |
| `copy/generic-label` | a string that is only "Submit", "OK", "Yes", "No", "Learn more", "Welcome", "Click here" | A | deferred |
| `copy/generic-error` | an error string that is only "Something went wrong" or "An error occurred" | A | deferred |
| `copy/unsupported-claim` | placeholder people and companies ("John Doe", "Acme") and unsourced figures ("10x faster", "99.9% uptime", "10,000+ users", sample prices) | A | deferred |
| `look/side-tab` | `border-left` or `border-right` wider than 1px with a color on a card-like selector | A | immediate |
| `look/gradient-text` | `background-clip: text` with a gradient, or transparent text fill | A | immediate |
| `look/hard-offset-shadow` | `box-shadow: Npx Npx 0 <color>` (zero blur) | A | immediate |
| `look/bounce-easing` | `cubic-bezier` that overshoots (a y value above 1 or below 0), or `bounce`/`elastic` timing names | A | deferred |
| `look/eyebrow` | element with class `eyebrow`, `kicker` or `overline` placed before a heading | A | deferred |
| `look/placeholder-image` | `<img>` with empty or `#` src, or a placeholder host (unfinished work, not taste) | W | immediate |
| `desx/contrast` | WCAG ratio of `color` against `background` in one rule (existing) | W | immediate |
| `desx/heading-skip` | heading level jump (existing) | W | deferred |
| `desx/nested-cards` | card, panel or tile inside another, by tag depth (existing; hurts hierarchy whoever wrote it) | W | deferred |
| `desx/button-states` | enabled and disabled buttons with no `:disabled` style (existing) | W | deferred |
| `desx/spacing-scale`, `desx/radius-scale`, `desx/type-sizes` | off the inferred 4px scale; more than 4 font sizes in a file (existing) | A | deferred |
| `desx/missing-alt` | `<img>` with no `alt` attribute (accessibility) | W | immediate |
| `desx/crushed-tracking` | `letter-spacing` below -0.04em (legibility; demoted from warning after calibration: display type is often tracked this tight on purpose) | A | immediate |
| `desx/gray-on-color` | a low-saturation text color on a saturated background, from the same rule (readability) | W | deferred |
| `slopx/waiver-without-reason` | a waiver comment with no reason | W | immediate |

Rule catalog, tier 2 (SHOULD; each with a test when implemented; unfinished rows stay listed as backlog)

| Id | Detection | Sev |
| --- | --- | --- |
| `code/narrating-comment` | short comment whose words all appear in the next code line | A |
| `copy/repeated-text` | the same text (6+ characters) in two text nodes in a row, outside lists, table cells and code | A |
| `copy/exclamation-run` | 2 or more `!` in a string | A |
| `copy/theater` | the pattern "<word> theater" | A |
| `copy/prose-*` (only with `--prose`, in Markdown) | banned vocabulary, filler framing, forced contrast, em dash and double hyphen as a dash | A |
| `look/ghost-card` | 1px border together with a shadow blur of 24px or more in one rule | A |
| `look/extreme-radius` | border-radius of 24px or more on a card-like selector (not pills) | A |
| `look/border-accent-rounded` | border 3px or wider with color on a rounded element | A |
| `look/glass-everywhere` | `backdrop-filter: blur` in 3 or more rules of one file | A |
| `look/stripe-gradient` | `repeating-linear-gradient` or `repeating-radial-gradient` | A |
| `look/glow-shadow` | `box-shadow: 0 0 Npx <color>` with N of 16 or more | A |
| `look/ai-palette` | a gradient with purple and blue/cyan stops | A |
| `look/overused-font` | first family in `font-family` is Inter or Geist | A |
| `look/marquee-blink` | `<marquee>`, or infinite `marquee`/`blink` keyframe animations | A |
| `look/numbered-label` | a bare `01`, `02`, `1.` label element before a heading | A |
| `look/pulsing-dot` | infinite `pulse` animation on a small element | A |
| `desx/tiny-text` | `font-size` of 11px or less on text selectors | A |
| `desx/tight-line-height` | `line-height` under 1.2 on text selectors | A |
| `desx/justified-text` | `text-align: justify` | A |
| `desx/all-caps-body` | `text-transform: uppercase` on paragraph or body selectors | A |
| `desx/wide-body-tracking` | `letter-spacing` above 0.1em on paragraph or body selectors | A |

Judgment checks (skill only, not in the script). Generic (slopx): icon tile above every heading, badge above the headline, hero-metric block, identical card grids, cream or beige palette by reflex, italic serif display headline, decorative grid background, rough or placeholder-style illustrations, a layout that would fit any product. Quality (desx): monotonous spacing, hierarchy that does not guide the eye, inconsistent components, missing responsive behavior.

Skill
- [ ] The skill is read-only. Order: run the script (all four passes), confirm each hit by reading the line, run the `desx` sub-skill's judgment for the `quality` pass, apply the judgment checks, report by priority in two groups ("Generic" and "Design quality"), then stop.
- [ ] Judgment checks beyond the table: defensive checks that types or an earlier validation already guarantee, three or more near-identical blocks, docstrings on trivial functions; the competitor test (swap in a competitor's name; if nothing becomes false, the text is generic); vague calls to action; errors that do not say what failed, why and how to recover; empty states that do not tell first use from no results from filters from permissions; destructive actions that do not name the object and its consequence; placeholders used as labels; icon-only controls without an accessible name; inconsistent terms for one concept; tone or language drift against the project's own strings.
- [ ] Triage flow for each finding: fix it if real; if it is a confident false positive, add the narrowest ignore (`ignoreValues` before a rule or file ignore), put the evidence in `reason`, and tell the user; if unsure, ask once; rule-wide or file-wide ignores need the user's approval. A `look/*` advisory the brand chose on purpose is a normal waiver case.
- [ ] The skill lists the suggestions grouped by `handoff` command and says applying them is a separate step (the user, `/desx apply` for `desx/*` findings, or Impeccable if installed). `handoff` is a command name only: `clarify` for copy, `layout` for nesting and spacing, `typeset` for type, `colorize` for contrast, color and palette, `distill` for decoration, `polish` as the general case, none for code findings (those point to `/lexis review`). Slopx never calls Impeccable and works without it.
- [ ] The skill does not repeat the abstraction, dependency, size, test or type checks of `/lexis review`.
- [ ] Output language follows the user's language setting (fix-distribution D1). Code, comments and docs are English.

Positioning text
- [x] Wherever `desx` is described as "visual slop + design-system drift", it is reworded to design quality (consistency with the project's system, hierarchy, accessibility, readability), and `slopx` is described as keeping output from looking generic or AI-made: `AGENTS.md` and its four static copies, `README.md`, `DESX.md`, `docs/desx.md`, `docs/specxis.md`, `skills/desx/SKILL.md` description and its Cursor copy, `commands/desx*.toml`, `.opencode/commands/desx*.md`, the `pi-extension` command descriptions, and the site strings.

### SHOULD (strong preference, can deviate with // lexis: comment)
- [x] Tier 2 rules.
- [x] Opt-in hook for Claude Code: `scripts/slopx-hook.js` reads the PostToolUse payload (`tool_name`, `tool_input.file_path`), runs only the `immediate` tier on that one file when it is eligible, and returns `{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"..."}}` with factual (not imperative) text. It never blocks, always exits 0, deduplicates what it already reported in the session, and is off unless `hook.enabled` is true in `.slopx.json` or `SLOPX_HOOK=1`. `SLOPX_HOOK_DISABLED=1` wins. Delivered as a settings snippet in `docs/slopx.md` (matcher `Edit|Write|MultiEdit`), not in the plugin's `hooks/hooks.json`.
- [x] Golden-file tests pin the plain and JSON output for a fixture, so format changes are deliberate (as Impeccable pins its output).
- [x] `--base <ref>` compares against `merge-base(ref, HEAD)` plus the working tree; the ref is validated with `git rev-parse --verify`.
- [x] Registered on every host that has `/desx`: Claude Code (skill), Gemini (`commands/*.toml`), OpenCode (`.opencode/commands`), pi (`registerCommand`), Cursor (`.cursor/skills` copy), and the installer's command filter.
- [x] One doc, `docs/slopx.md`: the ownership table above; boundaries with `/lexis review` and Impeccable; the rule table generated from `--list-rules`; waivers and config; the hook snippet; the handoff table; a credit line for Impeccable; the statement that findings are patterns, not proof of authorship.

### MAY (optional, implement only if trivial)
- [ ] A Stop-time deep pass, only after the Stop-hook contract is confirmed and with a loop guard.
- [ ] Tokens from `:root` custom properties as an allowlist for fonts, colors and radii ("value outside the project's tokens"), a `desx/*` rule.
- [x] Site strings (`en.ts`, `es.ts`) and a README row beyond the positioning text.

## Constraints
- Performance: one `git diff` call plus one pass over the changed and untracked files; `--all` is the only mode that walks the tree. The hook handles one file per call and exits at once when disabled.
- Security: `git` through `spawnSync` with fixed arguments, no shell; `--base` validated and passed as one argument; no line text in output; symlinks never followed; the hook runs with the agent's environment, so it reads only the file named in the payload.
- Language: plain JS, CommonJS, stdlib only. No new dependency. Phrase lists are English and Spanish, one constant, our own wording.
- `/desx` keeps its behavior and exit code 0 default; it gains only the new `desx/*` quality rules.

## Acceptance Criteria
- [x] A fixture change with one case of every tier 1 rule yields exactly those findings with the right `file:line`, rule id and owner; a clean change yields none; all four passes appear in the report either way.
- [x] A change with no UI files reports "look and quality: no UI files in scope" and does not fail.
- [x] Legacy slop outside the diff is not reported by the code and copy passes; `look` and `quality` findings in a changed file are marked file-level.
- [x] Ownership is disjoint: no problem is reported by both a `look/*` and a `desx/*` rule, and `/desx` on its own reports no `look/*` finding.
- [x] Not reported: a waived line (all three forms, comma lists and `*`), a `// lexis:` line, a `console.log` or emoji in a test file, a `console.log` in a file that already uses `console.*` or has a shebang, an empty catch with a comment, `_unused`, `@deprecated`, JSDoc examples, `(c)`, arrows, check marks, an `ignoreValues` match, a path in `ignoreFiles`. A waiver without a reason is reported.
- [x] Reported: `debugger`; a `console.log` in a file with no other `console.*`; a real emoji; `Lorem ipsum` in a `.tsx`; "John Doe" in an i18n file; a 3px `border-left` on a card; gradient text; a `4px 4px 0` shadow; an overshooting `cubic-bezier`; `<img src="">`; `<img>` with no alt; `letter-spacing: -0.06em`; `class="eyebrow"` before an `h2`.
- [x] A repo with no commits, a file named `ñandú.js`, CRLF endings, and an untracked symlink each run without error; the symlink target is not read.
- [x] `--list-rules` lists every rule once and matches the generated table in `docs/slopx.md`; `--json`, `--github` and `--quiet` match the contract; `--github` with `--json` exits 1; exit codes are 0, 1 and 2 as specified, and advisory-only findings exit 0; `--no-advisory` removes advisory findings from the output.
- [x] No output contains flagged line text; after a run `git status --porcelain` is unchanged and `DESIGN-AUDIT.md` was not created.
- [x] A bad `.slopx.json`, an ignore without a reason, an unknown flag, or `--base` with a missing ref exits 1 with a readable message and no stack trace. Tested through `spawnSync`.
- [x] Hook: disabled, the script prints nothing and exits 0; enabled, an edit that introduces an immediate-tier finding returns the `additionalContext` JSON; a second identical edit is not reported again; a non-eligible file produces no output; it never exits non-zero. Cold start is measured and recorded in `tasks.md`.
- [x] The positioning text no longer calls `desx` a slop detector anywhere in the places listed above (checked with a grep recorded in `tasks.md`).
- [x] Calibration: run against `git diff HEAD~N` of this repository (`N` the smaller of 20 and the first-parent commit count) and read every warning by hand. Record counts and false positives in `tasks.md`. If more than 1 in 10 of a rule is wrong, demote it to advisory or tighten it before the spec closes.
- [x] `npm test`, `npm run lint` and `node scripts/check-rule-copies.js` pass, and `claude plugin validate .` passes with the new skill.
