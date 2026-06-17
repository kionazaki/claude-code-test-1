---
name: app-e2e-test
description: Use this skill when asked to manually test / E2E-test this Notes app end to end (auth, UI, creating and saving notes, sharing) and capture a screenshot at each step. It is a battle-tested runbook — follow it to get a clean run on the FIRST try, avoiding the pitfalls discovered previously.
---

# Notes App — End-to-End Test Runbook

A step-by-step, browser-driven test of the Notes app that screenshots every step.
This document is a living runbook: whenever something does NOT work by default, the
fix is recorded in **Gotchas & fixes** so the next session gets it right immediately.

## What this tests

1. Registration (create a new user)
2. Login / logout (auth)
3. Notes list & editor UI
4. Creating a note (title + rich text)
5. Saving in different ways: full editor page, modal from the list, and publishing (public share link)
6. Auth guard: visiting `/notes` while logged out redirects to `/login`

## Key facts about the app (verified from source)

- Runtime is **Bun**, never node/npm. Next.js must be run as `bun --bun x next ...`.
- Save is **manual** (a `Save` button); there is **no autosave**.
- New note: page `/notes/new` → POST `/api/notes`; after save it redirects to `/notes/<id>/edit`.
- Existing note: `/notes/<id>/edit` (full page) OR a **modal** opened from the list (`NoteModal`). Both PATCH `/api/notes/<id>`.
- Save status text appears as `Saving…` then `Saved ✓` (selector: text "Saved").
- Sharing: `ShareControls` toggles public, public page is `/share/<publicId>`.
- Register form fields and login: see `components/auth/RegisterForm.tsx` / `LoginForm.tsx`.

## Setup (do once per fresh environment)

> As of the current `Dockerfile`, the image ships **bun** and the **Chromium system
> libraries** pre-installed. On a freshly rebuilt image (`docker compose build`),
> gotchas #1, #2 and #5 below no longer apply — skip straight to the steps here.
> If you are on an OLD image where `bun` is missing, apply gotcha #1 first.

```bash
# 1. Env file must exist (see CLAUDE.md). If missing:
#    cp .env.example .env.local   # then ensure BETTER_AUTH_SECRET is 32+ chars
# 2. Create the better-auth tables (registration fails without this):
bun run db:migrate
# 3. Install the browser engine for the robot (one-time download, ~115 MB):
npx playwright install chromium
# 4. Start the dev server in the BACKGROUND, capture logs:
bun run dev   # run_in_background; wait until it logs "Ready" / listening on :3000
# 5. Run the test (screenshots land in screenshots/):
node .claude/skills/app-e2e-test/e2e-test.mjs
```

Screenshots go to `screenshots/` (gitignored) named via the `screenshot` skill format:
`screenshot-YYYY-MM-DD_HH-MM-SS-<step>.png`. Generate the timestamp at run time.

## How the test is driven

A Playwright script (Chromium) opens pages, fills forms, clicks, and screenshots each
step. Use a unique test user per run (e.g. email `tester+<timestamp>@example.com`) so
re-runs don't collide on "email already registered".

## Steps (one screenshot each)

1. `/` home
2. `/register` empty form
3. fill + submit register → lands on `/notes`
4. `/notes` list
5. `/notes/new` editor
6. type title + body
7. click Save → wait for "Saved ✓"
8. back to `/notes` — note present
9. open note in modal, edit, save
10. enable sharing, copy link
11. open `/share/<publicId>` as a fresh (logged-out) context
12. logout
13. visit `/notes` logged out → redirected to `/login`
14. log back in → `/notes`

## Gotchas & fixes

> Append every real-world failure + fix here as it happens. Keep entries concrete
> (exact command, exact error, exact fix).

### 1. `bun: command not found`
The container has only node/npm; bun is NOT pre-installed, but the whole app needs it
(`bun:sqlite` is a Bun built-in — node cannot run this app at all).
- The official installer fails: `error: unzip is required to install bun` (unzip absent, no root to add it).
- `npm install -g bun` fails with `EACCES` (no write access to `/usr/local/lib`, we are uid 1000 `node`).
- **Fix that works:** install into a user-writable prefix:
  ```bash
  mkdir -p ~/.npm-global
  npm install -g bun --prefix ~/.npm-global
  export PATH="$HOME/.npm-global/bin:$PATH"   # MUST be re-exported in every shell —
                                              # shell state does not persist between tool calls
  bun --version   # -> 1.3.14
  ```

### 2. PATH does not persist between commands
Each Bash tool call is a fresh shell. Prefix EVERY bun/bunx/node command with
`export PATH="$HOME/.npm-global/bin:$PATH"` (or use the absolute path
`~/.npm-global/bin/bun`).

### 3. `db:migrate` says "No migrations needed"
That's fine — the auth tables already exist in `sqlite.db`. Not an error.

### 4. Dev server
`bun run dev` → Turbopack, ready in ~3s on :3000. `/` returns 307 (redirects to
`/login` when logged out). Run it in the background and poll with curl until it
answers; first compile of a route can take several seconds.

### 5. ⛔ BLOCKER (FIXED in Dockerfile): Chromium can't launch — missing system libraries
> Resolved at the image level — the `Dockerfile` now runs
> `npx playwright@1.61.0 install-deps chromium` as root at build time. Rebuild the
> image and this no longer happens. The notes below are kept for diagnosis on old images.

`chrome-headless-shell` dies with `error while loading shared libraries:
libglib-2.0.so.0: cannot open shared object file`. `ldd` shows **17 missing libs**
(libglib-2.0, libgobject-2.0, libnspr4, libnss3, libnssutil3, libgio-2.0, libatk-1.0,
libatk-bridge-2.0, libdbus-1, libXcomposite, libXdamage, libXfixes, libXrandr, libgbm,
libxkbcommon, libasound2, libatspi). They are not present anywhere on the system.
- `npx playwright install-deps` / `--with-deps` need **root** → fail (no sudo, uid 1000).
- `apt-get update`/`install` need root and the apt lists are empty → fail.
- **This cannot be fixed from inside the running container without root.**

**Proper fix (do this once, at the image level) — pick one:**
- **A. Best:** base the test image on Microsoft's Playwright image, which ships the
  browsers + all deps:
  ```dockerfile
  FROM mcr.microsoft.com/playwright:v1.61.0-jammy
  ```
- **B.** Keep `node:22-slim` but add the deps as root during build, before dropping to
  the `node` user:
  ```dockerfile
  RUN npx -y playwright@1.61.0 install-deps chromium
  # or: apt-get update && apt-get install -y libglib2.0-0 libnss3 libnspr4 \
  #     libatk1.0-0 libatk-bridge2.0-0 libdbus-1-3 libxcomposite1 libxdamage1 \
  #     libxfixes3 libxrandr2 libgbm1 libxkbcommon0 libasound2 libatspi2.0-0
  RUN npx -y playwright@1.61.0 install chromium
  ```
  Then rebuild the image (`docker compose build`) and re-run the test.
- **C. Last resort, no rebuild:** run the test from the *host* (where a normal browser
  exists) against the app, instead of inside this slim container.

## Teardown

- Stop the background dev server.
- Screenshots remain in `screenshots/` for the human to review; do not commit them.
