---
name: screenshot
description: Use this skill whenever the user asks you to take, capture, or save a screenshot of the app, a page, or the UI. Defines where screenshots are stored and how they are named so every screenshot lands in one predictable place with a unique, human-readable filename.
---

# Screenshot

## Purpose

Standardize how screenshots are captured in this project: a single location and a
consistent, unique, human-readable filename for every screenshot, so they never
clutter the repo root and are easy to find and sort.

## When to use

Use this skill any time the user asks for a screenshot, e.g.:

- "сделай скриншот этой страницы"
- "screenshot the login page"
- "capture the current UI"
- "take a screenshot after the change"

## Rules

1. **Location.** Save every screenshot into the `screenshots/` directory in the
   project root. Create the directory if it does not exist (`mkdir -p screenshots`).
   Never save screenshots to the project root or anywhere else.

2. **Filename format.** Names must be unique and contain the date and time so a
   human can tell when each shot was taken:

   ```
   screenshot-YYYY-MM-DD_HH-MM-SS.png
   ```

   When you have meaningful context about what is being captured, append a short
   kebab-case slug:

   ```
   screenshot-YYYY-MM-DD_HH-MM-SS-<slug>.png
   ```

   Examples:
   - `screenshots/screenshot-2026-06-17_14-30-05.png`
   - `screenshots/screenshot-2026-06-17_14-30-05-login-page.png`

   Rationale: the `YYYY-MM-DD_HH-MM-SS` layout sorts chronologically by filename,
   is unambiguous to a human, and avoids characters that are illegal or awkward in
   filenames (no `:`, no spaces). The seconds component keeps names unique.

3. **Generate the timestamp at capture time** — do not hardcode or guess it. Get
   it from the system clock:

   ```bash
   ts=$(date +"%Y-%m-%d_%H-%M-%S")
   mkdir -p screenshots
   # then save to: screenshots/screenshot-${ts}.png
   #          or:  screenshots/screenshot-${ts}-<slug>.png
   ```

   If two screenshots could be taken within the same second, the slug (or a short
   counter suffix) keeps them distinct.

4. **Format.** Default to PNG. Keep the same naming scheme for other image formats
   if explicitly requested (just change the extension).

## Notes

- The `screenshots/` directory is gitignored — screenshots are local artifacts and
  must not be committed. (This is enforced in `.gitignore`, not by this skill.)
- After saving, tell the user the relative path of the file you created.
