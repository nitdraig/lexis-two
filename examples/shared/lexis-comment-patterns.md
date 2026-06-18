# `// lexis:` Comment Patterns

Canonical tags used in `after.*` files across `examples/`. Same vocabulary as production code audited by `/lexis debt`.

| Tag | When to use |
| --- | ----------- |
| `simplified` | Replaced a heavier pattern with a smaller correct one |
| `skipping abstraction` | Deleted a helper/wrapper used only once |
| `using native <dialog>` / platform note | Browser or runtime already ships the feature |
| `tech debt` | Known shortcut — revisit when requirements grow |
| `stdlib first` | Standard library covers it (sort, parse, format) |
| `no dep needed` | Avoided a new npm package |

**Format:** `// lexis: <short reason>` in TS/JS; `# lexis: <short reason>` in Python.

**Harvest:** `/lexis debt` or `node scripts/specxis-debt.js` scans the repo and updates `.specxis/debt.md`.
