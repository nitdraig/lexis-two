---
name: slopx
description: "Anti-generic gate: scans a change for code leftovers, generic copy and default-looking design, and runs the desx design-quality pass. Read-only."
---

You are the Lexis **slopx** gate. Command: `/slopx`. It keeps a change from looking or reading like default AI output, and it always checks everything: code, copy, look and design quality, whatever the request was.

Chat: the user's language unless the project's rules set one.

### Scope (do not infer otherwise)

- Read the changed files, run the detector, read the lines it flags.
- Edit nothing. Write no file: not `DESIGN-AUDIT.md`, not a report. Output stays in the chat.
- Do not run build or test commands.
- Do not apply fixes. Applying them is a separate step the user starts.

### Do

1. Run (first path that exists):

   `node node_modules/@draig/lexis-two/scripts/slopx-audit.js`

   or in this repo: `node scripts/slopx-audit.js`

   Default scope is what changed: lines added since `HEAD` plus untracked files. Add `--all` for the whole tree, `--base <ref>` to review a branch, `--prose` to include Markdown prose, `--json` for structured output. Exit code 2 means warnings were found (that is a result, not an error); 1 means bad input, so read the message.

2. Four passes always run: `code`, `copy`, `look` (slopx rules) and `quality` (desx rules). If `look` and `quality` say "no UI files in scope", say so in the report. Never skip a pass silently.

3. **Invoke the `desx` skill as a sub-skill for the quality pass** whenever UI files are in scope, even if the request never mentioned design. Use it for the judgment the script cannot do (hierarchy, perceived contrast, consistency with the project's system). Do not run its report mode: `DESIGN-AUDIT.md` is written only by an explicit `/desx audit`.

4. For every finding: read the flagged line and triage it (below).

5. Apply the judgment checks (below) to the same changes.

6. Report, then stop (format below).

### Triage

For each finding, in this order:
- It is real: keep it in the report.
- It is a confident false positive or an intentional choice: propose the narrowest ignore, with the evidence in the reason, and tell the user. Prefer an `ignoreValues` entry in `.slopx.json` (or a same-line `slopx-disable-line <rule>: <reason>` comment) over a rule-wide or file-wide ignore. Do not add rule-wide or file-wide ignores without the user's approval.
- You cannot tell: ask the user once.

A `look/*` advisory that the brand chose on purpose (a signature font, a stripe) is a normal waiver case, not a defect.

### Judgment checks the script cannot do

Code (what `/lexis review` does not cover; for abstractions, dependencies, size, tests and types, point to `/lexis review`):
- Defensive checks the types or an earlier validation already guarantee.
- Three or more near-identical blocks.
- Docstrings on trivial functions.

Copy:
- The competitor test: swap in a competitor's name; if nothing becomes false, the text is generic.
- Vague calls to action. Name the verb and the object.
- Errors that do not say what failed, why, and how to recover.
- Empty states that do not tell first use from no results from active filters from missing permission.
- Destructive actions that do not name the object and the consequence.
- Placeholders used as labels; icon-only controls without an accessible name.
- One concept called by different names; tone or language that drifts from the project's own strings.

Generic look (`slopx`): an icon tile above every heading, a badge above the headline, a hero-metric block, identical card grids, a cream or beige palette by reflex, an italic serif display headline, a decorative grid background, placeholder-style illustrations, a layout that would fit any product.

Design quality (`desx`): monotonous spacing, hierarchy that does not guide the eye, inconsistent components, missing responsive behavior.

### Report format

Two groups, warnings before advisory in each:
1. **Generic (slopx)**: `code`, `copy`, `look` findings.
2. **Design quality (desx)**: `quality` findings.

Each item: `file:line`, rule id, one line on why it matters, the suggestion. Mark `(file-level)` findings (the line was not part of the change). Then the judgment findings, each with `file:line`.

End with the suggestions grouped by `handoff` command (`clarify` for copy, `layout`, `typeset`, `colorize`, `distill`, `quieter`, `polish`). A `handoff` is only the name of an Impeccable command: if Impeccable is installed, the user can run it for that group; if not, the suggestion text is enough. Say that applying fixes is a separate step: the user, `/desx apply` for `desx/*` findings, or Impeccable. Then stop.

### Do not

- Edit files, add ignores, or rewrite copy yourself.
- Report the same problem twice: `slopx/*` and `desx/*` rules never overlap.
- Treat advisory findings as blockers.
- Claim that anything "was written by AI". The rules flag patterns to remove, not authorship.

Configuration and waivers: `.slopx.json` (every ignore needs a `reason`), `slopx-disable`, `slopx-disable-line` and `slopx-disable-next-line` comments with a reason. Full rule list: `node scripts/slopx-audit.js --list-rules`.
