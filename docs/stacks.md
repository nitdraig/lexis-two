# Stack profiles

Lexis-Two keeps the philosophy stack-agnostic. Stack-specific conventions live in
`stacks/<id>.md`, one file per ecosystem. `AGENTS.md` stays universal; it only says
*how* to find and load the profile for the files you are editing.

## How detection works

When a coding task starts, the agent scans markers nearest to the task's files first,
most specific first:

| If you see | Profile | File | Status |
| --- | --- | --- | --- |
| `next.config.*` or dependency `next` | `node-ts` | `stacks/node-ts.md` | Shipped |
| `astro.config.*` or dependency `astro` | `js-astro` | `stacks/js-astro.md` | Planned |
| `package.json` + TypeScript (`tsconfig.json` / `"typescript"`), no Next/Astro | `node-ts` | `stacks/node-ts.md` | Shipped |
| `package.json` (JS, no TS/Next/Astro) | `node-ts` | `stacks/node-ts.md` | Shipped — skip TS-only bullets |
| `pyproject.toml` / `requirements.txt` / `Pipfile` | `python` | `stacks/python.md` | Planned |
| `go.mod` | `go` | `stacks/go.md` | Planned |
| `Cargo.toml` | `rust` | `stacks/rust.md` | Planned |

Rules:

- One clear profile for the task's path → read `./stacks/<id>.md` only; apply it to that scope.
- Several markers → ask which profile applies to the task's path (max 2 questions). Apply each profile only under its own tree; never merge two profiles into global laws.
- Marker but no profile file (planned id) → say so and continue with core philosophy only.
- No markers → ask once per session; pick a known id or "philosophy only".
- `./stacks/` missing → the install is incomplete; do **not** read `node_modules/@draig/lexis-two/stacks/`.

The choice is remembered in the session only (v1). Unambiguous detection never asks.

## Add a profile

1. Copy `stacks/_template.md` → `stacks/<id>.md` (English kebab-case id).
2. Fill `Detection` (markers), then only the `Frontend` / `Backend` / `Database` sections that apply. Do not invent shortcuts in a vacuum — seed from a real project.
3. Add one row to the "Stack profiles" detection table in `AGENTS.md`.
4. Re-sync the four instruction-tier copies and run the suite:

```bash
npm test
```

5. If the profile has an audit command, note it in `Tools`. If it has none, the security/audit skills fall back to generic checks.

## Customize an existing profile

Edit `stacks/<id>.md` directly. Keep the `Detection` block in sync with the row in `AGENTS.md`.
Re-installing without `--force` preserves your local edits (the installer skips existing `stacks/` files).

## Security and audit

`/lexis security` and `/lexis audit` are profile-aware:

- `node-ts` (or a repo with `package.json`): run `npm audit`, `depcheck`, and the Node/TS greps.
- No profile or a planned profile without an audit command: run generic checks only (secrets, injection-ish patterns, unvalidated input) and say so explicitly.

## Limits (v1)

- The stack choice is **not persisted** to disk. Ambiguous repos may ask once per session.
- No `stacks/active.md`, no override file, no `node_modules` fallback.
- Python / Go / Rust / Astro are detected honestly but shipped as planned ids until their profiles are filled.
