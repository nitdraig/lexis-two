# Desx — design audit (beside the loop)

`/desx` detects visual “AI slop” and drift from the **existing** design system. It is **not** a fourth phase of `discover → spec → implement`. Like `security-auditor`, it is a side pass: after UI changes, before a commit, or on demand.

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

Categories (deterministic): contrast (WCAG), spacing scale, radius scale, heading/type hierarchy, nested card/panel/tile, indistinguishable enabled/disabled controls.

v1 has **no** post-save hook. The report updates only on explicit `/desx audit`.
