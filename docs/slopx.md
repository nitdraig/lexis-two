# Slopx: the anti-generic gate

`/slopx` keeps a change from looking or reading like default AI output. It runs after an agent has written something and checks everything in one go: code, copy, look and design quality. It is read-only: it prints findings and suggestions and writes no file.

Public summary: [README](../README.md). Detector (no model, no API key): `node scripts/slopx-audit.js`.

---

## desx and slopx

| | `/desx` | `/slopx` |
| --- | --- | --- |
| Question | Is this good design? | Does this look, read or code like default AI output? |
| Compared against | The project's own system (scales, tokens) and objective standards (WCAG) | A catalog of known tells |
| Scope | UI files | Code, text and UI |
| Output | `DESIGN-AUDIT.md` (persistent, with checkboxes) and `/desx apply` | Stdout only |
| Weight | Mostly `warning` | Taste rules are `advisory`; a brand can waive them |
| Rule ids | `desx/*` | `code/*`, `copy/*`, `look/*` |

Test for a new rule: if the problem would be a defect even when a person made it (readability, accessibility, consistency with the project's system), it belongs to `desx`. If it is a problem because it is what models emit by default, and a brand could choose it on purpose, it belongs to `slopx`.

`/slopx` is still the full gate: it runs its own three passes (`code`, `copy`, `look`) and also invokes `desx` for the design-quality pass (`quality`). The two groups are shown under separate headings, and no problem is reported twice. `/lexis review` keeps the rule checks (abstractions, dependencies, size, tests, types); slopx points to it.

---

## What it scans

- Default: lines added since `HEAD` (staged and unstaged) plus untracked files. `look` and `quality` findings are marked `(file-level)` when the flagged line is not part of the change, because those detectors read whole files.
- `--all`: every eligible file. `--base <ref>`: compare against `merge-base(ref, HEAD)`. `--prose`: also check Markdown prose.
- Skipped: symlinks, files over 1 MB, binary files, and generated paths (`dist/`, `build/`, `*.min.*`, `*.d.ts`, lockfiles, `benchmarks/results/`). Test files and fixtures are exempt from the debug, copy, look and quality rules.
- A `// lexis:` comment exempts its line, as an intentional decision.

Output never contains the text of a flagged line (a debug call may print a secret). A finding carries `file:line`, the rule id, a description and a suggestion.

```bash
node scripts/slopx-audit.js                     # plain report
node scripts/slopx-audit.js --json              # { passes, findings }
node scripts/slopx-audit.js --github            # GitHub Actions annotations
node scripts/slopx-audit.js --quiet             # one summary line on stderr
node scripts/slopx-audit.js --list-rules        # the table below, without scanning
node scripts/slopx-audit.js --no-advisory       # warnings only
```

Exit codes: `0` no warnings (advisory findings may still be listed), `1` invalid input or a target that could not be scanned, `2` at least one warning. In CI, `--github` plus the exit code is enough.

---

## Rules

Severity `warning` is objective or unfinished work; `advisory` is taste or a heuristic, and never decides the exit code. Tier `immediate` rules are mechanical and also run in the hook. Rules marked tier 2 are conservative heuristics, and the `copy/prose-*` rules run only with `--prose`.

<!-- rules:start -->
| Id | Owner | Severity | Tier | What it catches |
| --- | --- | --- | --- | --- |
| `code/marker` | slopx | warning | immediate | Work marker or placeholder left in the code (TODO-style words, "rest of the code") |
| `code/debug-leftover` | slopx | warning | immediate | Debug call left in the code (debugger, console.log in a file that does not log) |
| `code/commented-out-code` | slopx | warning | deferred | Two or more consecutive comment lines that read as code |
| `code/compat-cruft` | slopx | warning | deferred | Backward-compatibility residue ("// removed ...", "// previously ...", names ending in _old) |
| `code/empty-catch` | slopx | warning | immediate | Empty catch block with no comment |
| `code/narrating-comment` | slopx | advisory | deferred, tier 2 | Comment that only restates the next line |
| `copy/emoji` | slopx | warning | immediate | Emoji in code, markup or text |
| `copy/placeholder-text` | slopx | warning | immediate | Placeholder text left in the UI ("Lorem ipsum", "Your text here", "Click here") |
| `copy/stock-vocabulary` | slopx | advisory | deferred | Stock marketing vocabulary (seamless, robust, elevate, empower, ...) |
| `copy/generic-claim` | slopx | advisory | deferred | Generic claim that promises value without saying what the product does |
| `copy/filler-framing` | slopx | advisory | deferred | Filler opener, closer or transition ("in today's", "in summary", "moreover") |
| `copy/forced-contrast` | slopx | advisory | deferred | Forced contrast ("not just X, it's Y") |
| `copy/em-dash-overuse` | slopx | advisory | deferred | Two or more em dashes (or a double hyphen used as a dash) in one string |
| `copy/generic-label` | slopx | advisory | deferred | Generic label ("Submit", "OK", "Learn more", "Welcome") |
| `copy/generic-error` | slopx | advisory | deferred | Error message with no cause or next step |
| `copy/unsupported-claim` | slopx | advisory | deferred | Invented data: placeholder people or companies, unsourced figures |
| `copy/repeated-text` | slopx | advisory | deferred, tier 2 | The same text appears twice inside one container |
| `copy/exclamation-run` | slopx | advisory | deferred, tier 2 | Run of exclamation marks in a string |
| `copy/theater` | slopx | advisory | deferred, tier 2 | Dismissing something as "<word> theater" instead of explaining |
| `copy/prose-vocabulary` | slopx | advisory | deferred, tier 2, --prose | Stock vocabulary or generic claim in Markdown prose (--prose) |
| `copy/prose-framing` | slopx | advisory | deferred, tier 2, --prose | Filler opener, closer or transition in Markdown prose (--prose) |
| `copy/prose-contrast` | slopx | advisory | deferred, tier 2, --prose | Forced contrast in Markdown prose (--prose) |
| `copy/prose-dash` | slopx | advisory | deferred, tier 2, --prose | Em dash or double hyphen used as a dash in Markdown prose (--prose) |
| `look/side-tab` | slopx | advisory | immediate | Thick colored border on one side of a card (the "alert" stripe) |
| `look/gradient-text` | slopx | advisory | immediate | Gradient text |
| `look/hard-offset-shadow` | slopx | advisory | immediate | Hard offset shadow with no blur |
| `look/bounce-easing` | slopx | advisory | deferred | Bounce or elastic easing |
| `look/eyebrow` | slopx | advisory | deferred | Small label above a heading (eyebrow, kicker, overline) |
| `look/placeholder-image` | slopx | warning | immediate | Image with an empty source or a placeholder service |
| `look/ghost-card` | slopx | advisory | deferred, tier 2 | Hairline border together with a wide soft shadow |
| `look/extreme-radius` | slopx | advisory | deferred, tier 2 | Very large corner radius on a card |
| `look/border-accent-rounded` | slopx | advisory | deferred, tier 2 | Thick colored border on a rounded element |
| `look/glass-everywhere` | slopx | advisory | deferred, tier 2 | Backdrop blur used in three or more rules of one file |
| `look/stripe-gradient` | slopx | advisory | deferred, tier 2 | Repeating-gradient stripes as decoration |
| `look/glow-shadow` | slopx | advisory | deferred, tier 2 | Colored glow shadow |
| `look/ai-palette` | slopx | advisory | deferred, tier 2 | Purple-to-blue gradient |
| `look/overused-font` | slopx | advisory | deferred, tier 2 | Default display font (Inter, Geist) as the first family |
| `look/marquee-blink` | slopx | advisory | deferred, tier 2 | Marquee or blinking decoration |
| `look/numbered-label` | slopx | advisory | deferred, tier 2 | Bare 01, 02, 03 label before a heading |
| `look/pulsing-dot` | slopx | advisory | deferred, tier 2 | Infinite pulsing status dot |
| `desx/contrast` | desx | warning | immediate | Text color against its background is below the WCAG ratio |
| `desx/heading-skip` | desx | warning | deferred | Heading levels skipped |
| `desx/nested-cards` | desx | warning | deferred | Card, panel or tile inside another one |
| `desx/button-states` | desx | warning | deferred | Enabled and disabled buttons look the same |
| `desx/spacing-scale` | desx | advisory | deferred | Spacing off the inferred 4px scale |
| `desx/radius-scale` | desx | advisory | deferred | Border radius off the inferred scale |
| `desx/type-sizes` | desx | advisory | deferred | More than four font sizes in one file |
| `desx/missing-alt` | desx | warning | immediate | Image without an alt attribute |
| `desx/crushed-tracking` | desx | advisory | immediate | Letter spacing tighter than -0.04em |
| `desx/gray-on-color` | desx | warning | deferred | Neutral gray text on a colored background |
| `desx/tiny-text` | desx | advisory | deferred, tier 2 | Text of 11px or smaller |
| `desx/tight-line-height` | desx | advisory | deferred, tier 2 | Line height under 1.2 on running text |
| `desx/justified-text` | desx | advisory | deferred, tier 2 | Justified text |
| `desx/all-caps-body` | desx | advisory | deferred, tier 2 | Running text in all caps |
| `desx/wide-body-tracking` | desx | advisory | deferred, tier 2 | Letter spacing above 0.1em on running text |
| `slopx/waiver-without-reason` | slopx | warning | immediate | slopx-disable comment with no reason |
<!-- rules:end -->

---

## Waivers and config

A rule that fires on something intentional is waived with a reason, never silently.

Inline, in `//`, `/* */` or `<!-- -->` form:

| Comment | Effect |
| --- | --- |
| `slopx-disable <ids>: <reason>` | The whole file |
| `slopx-disable-line <ids>: <reason>` | That line |
| `slopx-disable-next-line <ids>: <reason>` | The next line |

`<ids>` is a comma-separated list of rule ids, or `*`. A waiver with no reason is itself reported (`slopx/waiver-without-reason`) and does not apply. `--no-inline-ignores` turns waivers off.

`.slopx.json` at the project root (and an optional uncommitted `.slopx.local.json` that adds to it). Every ignore needs a `reason`:

```json
{
  "ignoreRules": [{ "rule": "code/debug-leftover", "reason": "worker debugging, removed before release" }],
  "ignoreFiles": [{ "glob": "vendor/**", "reason": "vendored" }],
  "ignoreValues": [{ "rule": "copy/emoji", "value": "(the brand emoji)", "reason": "brand mark" }],
  "extensions": [{ "ext": ".blade.php", "engine": "html" }],
  "advisoryRules": "include"
}
```

Prefer the narrowest form: `ignoreValues` (a finding's `ignoreValue` field names the value) before `ignoreRules` or `ignoreFiles`. `--no-config` skips both files. The config is data, parsed as JSON and never executed; globs cannot leave the repository.

---

## Suggestions and handoff

Every finding has a one-line `suggestion`, a direction and not a rewrite, and an optional `handoff`: the name of the [Impeccable](https://github.com/pbakaus/impeccable) command that applies that kind of fix when Impeccable is installed. Slopx never calls Impeccable and works without it.

| `handoff` | Findings |
| --- | --- |
| `clarify` | all `copy/*` |
| `layout` | `desx/nested-cards`, `desx/spacing-scale` |
| `typeset` | `look/gradient-text`, `look/eyebrow`, `look/overused-font`, `look/numbered-label`, type rules of `desx/*` |
| `colorize` | `desx/contrast`, `desx/gray-on-color`, `look/ai-palette` |
| `distill` | `look/side-tab`, `look/hard-offset-shadow`, `look/ghost-card`, `look/extreme-radius`, `look/border-accent-rounded`, `look/stripe-gradient` |
| `quieter` | `look/bounce-easing`, `look/glow-shadow`, `look/glass-everywhere`, `look/marquee-blink`, `look/pulsing-dot` |
| `polish` | `look/placeholder-image`, `desx/button-states`, `desx/radius-scale`, `desx/missing-alt` |
| (none) | `code/*`: use `/lexis review` |

The invocation differs per host (`/impeccable <command>` in most, `$impeccable` on Codex). The skill ends its report with the suggestions grouped by this command and leaves applying them to you: the user, `/desx apply` for `desx/*` findings, or Impeccable.

---

## Hook (opt-in, Claude Code)

After each edit, a hook can run the `immediate` rules on that one file and tell the agent what it found. It never blocks, always exits 0, and reports a finding once per session. It is off unless you turn it on, and it is not part of the plugin's `hooks/hooks.json`, so nobody pays a process start per edit by default (idle: about 50 ms; active, including the audit: about 200 ms on the machine where it was measured).

Turn it on with `SLOPX_HOOK=1` or `{ "hook": { "enabled": true } }` in `.slopx.json`. `SLOPX_HOOK_DISABLED=1` wins over both. Then add to `.claude/settings.local.json` (or your user settings):

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          { "type": "command", "command": "node \"${CLAUDE_PROJECT_DIR}/node_modules/@draig/lexis-two/scripts/slopx-hook.js\"" }
        ]
      }
    ]
  }
}
```

In a clone of this repository use `${CLAUDE_PROJECT_DIR}/scripts/slopx-hook.js`. The hook returns `hookSpecificOutput.additionalContext` with factual text. It runs with your agent's environment and reads only the file named in the edit payload. A Stop-time deep pass is not part of it.

---

## Limits

- Source-level checks, not a rendered page: no rendered contrast, overflow or clipped menus, and Tailwind classes are only read for a few rules.
- Heuristics have false positives. That is why taste rules are advisory and every ignore needs a reason.
- The rules flag patterns to delete or rewrite. They say nothing about who wrote the text, and no rule proves authorship.
- Vocabulary lists are English and Spanish, kept in one constant in `scripts/slopx-rules.js`.

## Credit

The rule catalog, the CLI contract (exit codes, `--list-rules`, `--github`, waivers that need a reason) and the idea of a two-tier hook follow the public design of [Impeccable](https://github.com/pbakaus/impeccable) (Apache 2.0), a design vocabulary for coding agents. The rules, lists and wording here are our own; no code or text was copied.
