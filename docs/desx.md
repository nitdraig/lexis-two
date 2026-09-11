# Desx — process

Public summary: [DESX.md](../DESX.md). Portability: [portability.md](./portability.md).

`/desx` sits **beside** Discovery and Specxis. It is a read-mostly design pass, not a sequential SDD phase.

---

## When to run

| Run | Skip |
|-----|------|
| After executor/agent UI work | No markup/CSS in the change |
| Before commit if screens look generic | Backend-only / API-only |
| User asked `/desx audit` | You only needed `/lexis review` (over-engineering, not visuals) |

Command: **`/desx`** or **`/desx audit`**. Apply: **`/desx apply`**. Detector: `node scripts/desx-audit.js`.

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
node scripts/desx-audit.js [--cwd dir] [--out path] [--git] [--json]
```

From an app that installed the package:

```bash
node node_modules/@draig/lexis-two/scripts/desx-audit.js
```

`--git`: only UI files in `git diff --name-only HEAD` (falls back to a full walk if none). Default is a full walk of UI-like extensions (css, html, jsx/tsx, vue, svelte, …).

It is **source-level**, not computed styles in a browser. Consecutive color literals within ~180 characters are treated as candidate text/background pairs.

Seed template (optional): `templates/desx/DESIGN-AUDIT.md`. The script always writes a full report on each run and **merges** the Resueltos section.

---

## `DESIGN-AUDIT.md` merge rules

- Never drop **Resueltos**; only append.
- Pending locators that no longer appear in the new scan move to Resueltos with the run date.
- The auditor does not tick apply-checkboxes. The apply skill ticks items it actually fixed.

---

## Hook (not in v1)

A later post-edit hook may print a short deterministic summary on UI save. It must **not** rewrite `DESIGN-AUDIT.md`; that stays an explicit `/desx audit`.
