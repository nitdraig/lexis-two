# Desx — process

Public summary: [DESX.md](../DESX.md). Portability: [portability.md](./portability.md).

`/desx` sits **beside** Discovery and Specxis. It is a read-mostly design pass, not a sequential SDD phase.

---

## When to run

| Run | Skip |
|-----|------|
| After executor/agent UI work | No markup/CSS in the change |
| Before commit if you want the design checked against your system | Backend-only / API-only |
| User asked `/desx audit` | You only needed `/lexis review` (over-engineering, not visuals) |

Command: **`/desx`** or **`/desx audit`**. Apply: **`/desx apply`**. Detector: `node scripts/desx-audit.js`.

`/desx` improves design quality. It does not judge whether something merely looks generic or AI-made: that is [`/slopx`](./slopx.md), which also runs this detector as its quality pass without writing a report.

---

## Roles

| Role | Command | Allowed writes |
|------|---------|----------------|
| `design-auditor` | `/desx audit` | `DESIGN-AUDIT.md` only |
| Implementer (`lexis-one` / `build`) | `/desx apply` | UI/styles + checkboxes in the audit file |

`design-auditor` must not run build/test, move files, or edit components.

This package ships the **skill and detector**, not a named OpenCode/Claude agent config. Hosts that already define `security-auditor` can add `design-auditor` the same way.

---

## Detector (no API key)

```bash
node scripts/desx-audit.js [--cwd dir] [--out path] [--git] [--json] [--dry-run] [--fail-on P0]
```

From an app that installed the package:

```bash
node node_modules/@draig/lexis-two/scripts/desx-audit.js
```

- `--git`: only UI files changed since `HEAD` (staged, unstaged and untracked), relative to `--cwd`, so it works from a subdirectory and in a repo with no commits. With nothing changed it scans nothing, says so and leaves the report alone; it never falls back to a full scan. Findings of files it did not scan stay exactly as they were.
- Default: every UI file that git tracks or does not ignore (a directory walk outside a repo). Folders named `node_modules`, `dist`, `build`, `fixtures`, `vendor` and dot-folders are skipped.
- `--json` and `--dry-run` print and write nothing.
- `--fail-on P0` exits 1 when a P0 finding exists. Default exit code is 0. Bad input (unknown flag, missing value, `--cwd` that does not exist, `--out` outside `--cwd`) exits 2 and writes nothing.

It is **source-level**, not computed styles in a browser:
- Contrast pairs the `color` and `background` declared in the same rule (or style attribute). `var()`, `hsl()`, named colors, gradients and transparency are skipped and counted.
- Spacing and radius need 8 or more samples before a 4px scale is assumed. `calc()`, values under 2px and pill radii are ignored.
- Nesting tracks tag depth: only a card/panel/tile inside another one is reported.
- A disabled button is reported only when no scanned stylesheet styles `:disabled` for its class; `disabled={x}` bindings are ignored.
- Utility classes (Tailwind) and CSS-in-JS are not analyzed. The report lists the coverage per category and says "no data" instead of "no issues" when a category had too few samples.

Seed template (optional): `templates/desx/DESIGN-AUDIT.md`. The script writes a full report on each run (in English) and **merges** the Resolved section. Reports written by 1.4.0 (Spanish headings) are still read.

---

## `DESIGN-AUDIT.md` merge rules

- Never drop **Resolved**; only append.
- A finding has a stable id (a trailing `<!-- desx:... -->` comment) built from file, category, description and occurrence, not from its line number. Editing lines above a finding moves its locator and changes nothing else. Keep the comment if you reword a description.
- Pending findings of scanned files that no longer appear move to Resolved with the run date. Findings of files the run did not scan are never moved.
- The auditor does not tick apply-checkboxes. The apply skill ticks items it actually fixed.

---

## Hook (not in v1)

A later post-edit hook may print a short deterministic summary on UI save. It must **not** rewrite `DESIGN-AUDIT.md`; that stays an explicit `/desx audit`.
