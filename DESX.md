# Desx — design audit (beside the loop)

`/desx` improves design quality: consistency with the project's **existing** design system, hierarchy, accessibility and readability. Keeping output from looking generic is a different job, done by [`/slopx`](./docs/slopx.md). `/desx` is **not** a fourth phase of `discover → spec → implement`. Like `security-auditor`, it is a side pass: after UI changes, before a commit, or on demand.

Process: [docs/desx.md](./docs/desx.md). Detector (no model): `node scripts/desx-audit.js`.

**Rule:** `design-auditor` writes only `DESIGN-AUDIT.md`. Fixes are `/desx apply` (implementer).

This npm package does **not** register a host agent named `design-auditor`. Lexis-One (private) can map that role. Do not add fake agent blocks to this repo’s `opencode.json`.

---

## When to use

| Run `/desx` | Skip |
|-------------|------|
| After the agent generated or restyled UI | Backend-only change |
| Before a commit that touches CSS/markup | Typo / copy-only |
| Screens look generic (nested cards, weak contrast, heading skips) | No UI files in the diff |

---

## Commands

| Command | Who | Writes |
|---------|-----|--------|
| `/desx` or `/desx audit` (`/desx-audit`) | `design-auditor` | `DESIGN-AUDIT.md` only |
| `/desx apply` (`/desx-apply`) | implementer (`lexis-one` / `build`) | UI + ticks in the audit file, then re-audit |

---

## Output

`DESIGN-AUDIT.md` at repo root, or `docs/DESIGN-AUDIT.md` if `docs/` already exists.

Categories (deterministic): contrast (WCAG), spacing scale, radius scale, heading/type hierarchy, nested card/panel/tile, indistinguishable enabled/disabled controls, missing `alt`, and legibility (tight tracking and line height, tiny text, justified or all-caps body text, gray text on color).

v1 has **no** post-save hook. The report updates only on explicit `/desx audit`. `--json` and `--dry-run` write nothing; `--git` scans only changed UI files. Details and limits (what is not analyzed): [docs/desx.md](./docs/desx.md).
