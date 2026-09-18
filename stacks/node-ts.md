# Node + TypeScript profile

Index: Node, Next.js, Express/Fastify, MongoDB/Mongoose, PostgreSQL/Prisma, SQLite, Redis, Tailwind, TanStack Query, npm.

## Detection

| If you see | Use |
| --- | --- |
| `next.config.*` or dependency `next` | Next subsections below |
| `package.json` + TypeScript (`tsconfig.json` / `"typescript"`), no Next/Astro | TypeScript Rules + backend/DB sections |
| `package.json` (JS, no TS/Next/Astro) | JS-relevant parts; skip TS-only bullets |

Do not apply this profile to `.py`, `.go`, `.rs`, or Astro files (e.g. `site/`).

## Frontend (Next.js App Router / React / TypeScript)

- **Date input** → `<input type="date">`, not a datepicker library
- **Modal** → `<dialog>`, not a modal library
- **Tooltip** → `title` attribute or CSS `::after`, not a tooltip component
- **Animation** → CSS `transition`/`animation`, not framer-motion unless already installed
- **Form validation** → HTML5 attributes first, then zod if already in project
- **State** → `useState`/`useReducer` before zustand; zustand before redux
- **Table** → native `<table>` before react-table unless already installed
- **Server vs Client Components** → Server by default; `'use client'` only for interactivity
- **Data fetching** → TanStack Query if installed; native `fetch` in Server Components

## Backend (Express / Fastify / Node.js / TypeScript)

- **Validation** → zod if installed, not a new library
- **Auth middleware** → extend existing, don't create a parallel system
- **Caching** → in-memory `Map` before Redis unless Redis already configured
- **Scheduled job** → `setInterval` before a job queue unless already installed
- **Error handling** → centralized middleware, not per-route try/catch

## Database

**MongoDB / Mongoose (default)**

- **Aggregation** → single pipeline, not multiple queries
- **Pagination** → follow existing project pattern, don't invent a new one
- **Soft delete** → follow existing project convention
- **Indexes** → add only for fields actually queried; measure before adding

**PostgreSQL / Prisma**

- **Raw query** → Prisma ORM first; raw SQL only when ORM can't express it
- **Relations** → define in schema, not in application logic
- **Migrations** → always via `prisma migrate`, never manual schema edits
- **N+1** → use `include`/`select` to eager-load, not separate queries in loops

**SQLite**

- **Use when** → local dev, prototypes, single-user tools, embedded data
- **Don't use when** → multi-writer concurrency, production SaaS with scale
- **Driver** → `better-sqlite3` (sync, fast) unless async is explicitly required
- **Migrations** → keep them in a `/migrations` folder, never alter tables manually

**Redis**

- **Use for** → caching, sessions, rate limiting, pub/sub — not as primary DB
- **Cache strategy** → cache-aside by default; write-through only if explicitly needed
- **TTL** → always set a TTL; never store without expiry
- **Keys** → use namespaced keys: `app:feature:id` (e.g. `user:session:abc123`)
- **Don't cache** → user-specific writes, financial data, anything requiring consistency

**General rules across all databases**

- Check which DB the project uses before writing any query — don't assume MongoDB
- Follow the existing ORM/driver convention in the project, don't introduce a second one
- Transactions for multi-step writes regardless of DB engine

## TypeScript Rules

- `strict: true` always.
- Never use `any` or `unknown` without a `// lexis:` comment explaining why.
- Never use `as` or `!` unless absolutely necessary — same rule.
- Prefer `type` over `interface` except for public APIs.
- Let TypeScript infer types when possible.
- If types are unclear: stop and ask before writing code.

## Never Lazy About (TypeScript)

- TypeScript types.

## Tools

- **Security**: run `npm audit` (or the lockfile's ecosystem — pnpm/yarn when that lockfile is present).
- **Lint/test**: detect `eslint` and `scripts.test` in `package.json`. Never assume a script that is missing.
