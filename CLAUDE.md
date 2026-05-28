# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
bun run dev          # Start dev server
bun run build        # Production build
bun run start        # Start production server
bun run lint         # Run ESLint
bun run db:migrate   # Create better-auth tables (run once after first clone)
```

> **All commands must be run with `bun`**, not `npm` or `node`. The app depends on `bun:sqlite` (a native Bun built-in), so Next.js is always invoked as `bun --bun x next ...`.

## Environment

Copy `.env.example` to `.env.local` before starting. Required variables:

```
BETTER_AUTH_SECRET=   # 32+ char random string
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=./sqlite.db
```

## Architecture

**Stack:** Next.js 16 App Router · Bun runtime · SQLite via `bun:sqlite` · better-auth v1.6 · TipTap v3 editor · TailwindCSS v4

### Request lifecycle

1. **`proxy.ts`** (Edge runtime) — this is the Next.js middleware. It is intentionally **not** named `middleware.ts`. It enforces body size limits (1 MB), rate limiting (5 req/min for auth, 60/min for note writes), and redirects unauthenticated requests to `/notes/*` routes.
2. **Route handlers / Server components** — perform a second, full session validation via `lib/auth.ts`. Never trust only the proxy cookie check.
3. **Data access** — all DB calls go through `lib/notes.ts`. All queries are parameterized; private queries always include `user_id` in the WHERE clause.

### Database

SQLite via `bun:sqlite`. The schema in `db/schema.sql` is **auto-applied** at app startup by `lib/db.ts` (singleton `getDb()`). Auth tables (user, session, account, verification) are created separately by `bun run db:migrate`.

TipTap document content is stored as a JSON string in the `content_json` column. The `public_id` column stores a server-generated token (`pub_` + 16 random bytes) — it is never the internal `id`, and it is never accepted from the client.

### Auth

`lib/auth.ts` — server-side better-auth instance (email/password, min 8-char password).  
`lib/auth-client.ts` — client-side `createAuthClient()` for use in `"use client"` components.  
Auth API is mounted at `app/api/auth/[...all]/route.ts` via `toNextJsHandler`.

### Key non-obvious constraints

- All data-fetching pages use `export const dynamic = "force-dynamic"` — no static generation.
- `next.config.ts` lists `bun:sqlite` and `bun` in `serverExternalPackages` so they are never bundled by webpack.
- `components/ui/Modal.tsx` renders via a portal to `document.body`; it must only be used in client components.
- `lib/validation.ts` enforces a 512 KB cap on `content_json` and a 200-char cap on titles.
- There is **no test framework**. No test files exist.
