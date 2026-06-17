# Notes App

A rich-text note-taking web app built with Next.js, Bun, SQLite, better-auth, and TipTap.

## Tech Stack

- **Next.js 16** (App Router)
- **Bun** — runtime + package manager
- **SQLite** via `bun:sqlite`
- **better-auth** — email/password authentication
- **TipTap** — rich text editor
- **TailwindCSS 4**

## Getting Started

### 1. Prerequisites

Install [Bun](https://bun.sh):

```bash
curl -fsSL https://bun.sh/install | bash
```

### 2. Install dependencies

```bash
bun install
```

### 3. Environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Generate with: openssl rand -base64 32
BETTER_AUTH_SECRET=your-secret-here

BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=./sqlite.db
```

### 4. Create auth tables

```bash
bun run db:migrate
```

Runs `bunx --bun auth@latest migrate` to create the better-auth tables
(user, session, account, verification). The notes table is created automatically on first request.

### 5. Start the dev server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Running Claude Code in Docker

Run Claude Code in an isolated container with the project mounted:

```bash
docker compose run --rm claude
```

This builds the image (first run only), mounts the project into `/workspace`, and
starts an interactive Claude Code session. The `--rm` flag removes the container on exit.

Authentication and onboarding state persist across restarts via the `claude_home`
named volume, which mounts the entire `/root` home directory — covering both
`~/.claude/` and `~/.claude.json`. You authenticate once; subsequent runs skip the login flow.

See [`Dockerfile`](Dockerfile) and [`docker-compose.yml`](docker-compose.yml) for details.

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run db:migrate` | Create/migrate auth tables |

> **Important:** All scripts internally use `bun --bun x next …` so that Bun's runtime
> (and `bun:sqlite`) is available throughout the build and start processes.
> Do **not** run `next build` or `next dev` directly via Node.js.

## Project Structure

```
app/
  api/auth/[...all]/    ← better-auth catch-all handler
  api/notes/            ← Notes CRUD API
  login/ register/      ← Auth pages
  notes/                ← Protected notes pages
  share/[publicId]/     ← Public read-only note page
lib/
  auth.ts               ← better-auth server instance (bun:sqlite)
  auth-client.ts        ← better-auth React client
  db.ts                 ← SQLite connection (bun:sqlite)
  notes.ts              ← Notes data access layer
  validation.ts / utils.ts
components/
  auth/                 ← LoginForm, RegisterForm, LogoutButton
  notes/                ← NoteCard, NoteEditor, NoteToolbar, etc.
  ui/                   ← Button, Input, Modal
db/
  schema.sql            ← Notes table DDL
types/
  note.ts
proxy.ts                ← Route protection (Next.js 16 "proxy" convention)
```

## Features

- ✅ Email/password authentication (better-auth)
- ✅ Create, view, edit, delete notes
- ✅ Rich text (bold, italic, H1–H3, inline code, code block, bullet list, hr)
- ✅ Public sharing via unique link (`/share/:publicId`)
- ✅ Stop sharing / make private again
- ✅ All private routes protected
- ✅ All API routes require auth and check note ownership
- ✅ Parameterized SQL queries throughout
- ✅ Delete confirmation dialog
