# Technical Specification: Note Taking Web App

## 1. Project Overview

**Note Taking Web App** is a web application that allows users to create, manage, edit, delete, and publicly share text-based notes.

A note is a rich text document created with a **TipTap** editor. The note content is stored as **JSON** in a **SQLite** database.

Main technology stack:

* **Next.js**
* **TypeScript**
* **Bun**
* **SQLite using Bun's built-in SQLite client**
* **better-auth** for authentication
* **TipTap** for the rich text editor
* **TailwindCSS** for styling

---

## 2. Product Goals

### 2.1 Main Goals

The application must allow authenticated users to:

* create notes;
* view a list of their own notes;
* open and view a single note;
* update an existing note;
* delete a note;
* share a note publicly;
* stop sharing a public note.

### 2.2 Out of Scope for the First Version

The first version will not include:

* real-time collaborative editing;
* comments;
* tags or folders;
* full-text search;
* file attachments;
* markdown import/export;
* version history;
* offline mode;
* role-based access control.

These features can be added later after the core CRUD and public sharing functionality is complete.

---

## 3. Users and Permissions

### 3.1 User Types

#### Unauthenticated User

An unauthenticated user can:

* open the login and registration pages;
* view a public note if they have a valid public link.

An unauthenticated user cannot:

* create notes;
* view private notes;
* edit or delete notes;
* change sharing settings.

#### Authenticated User

An authenticated user can:

* create their own notes;
* view only their own notes;
* open and read their own notes;
* edit their own notes;
* delete their own notes;
* make their own notes public;
* stop sharing their own public notes.

---

## 4. Main User Flows

### 4.1 Sign Up / Sign In

1. The user opens the application.
2. If the user is not authenticated, they see the login or registration page.
3. After successful authentication, the user is redirected to the notes dashboard.

### 4.2 Create a Note

1. The user clicks **New Note**.
2. The system opens the note creation page or creates an empty draft note.
3. The user enters a title and rich text content.
4. The user saves the note.
5. The note appears in the user's notes list.

### 4.3 Edit a Note

1. The user opens one of their notes.
2. The system loads the note title and TipTap JSON content into the editor.
3. The user changes the text or formatting.
4. The user saves the changes.
5. The system updates the note and refreshes the `updated_at` timestamp.

### 4.4 Delete a Note

1. The user opens a note or uses an action from the notes list.
2. The user clicks **Delete**.
3. The system shows a confirmation dialog.
4. After confirmation, the note is deleted from the database.
5. If the note was public, its public link no longer works.

### 4.5 Share a Note Publicly

1. The user opens one of their own notes.
2. The user clicks **Share publicly**.
3. The system generates a unique `public_id` or `share_token`.
4. The note is updated with `is_public = true`.
5. The user receives a public URL that can be copied and shared.

### 4.6 Stop Sharing a Note

1. The user opens one of their public notes.
2. The user clicks **Stop sharing**.
3. The system sets `is_public = false`.
4. The public URL no longer displays the note content.

---

## 5. Functional Requirements

## 5.1 Authentication

The system must support:

* user registration;
* user login;
* user logout;
* active session validation;
* protected private routes.

Authentication must be implemented using **better-auth**.

### Acceptance Criteria

* An unauthenticated user cannot open the notes dashboard.
* An unauthenticated user cannot create, update, or delete notes through the API.
* An authenticated user can only see their own notes.
* A user cannot access another user's notes by changing the URL or API request.

---

## 5.2 Notes CRUD

### Create Note

A user can create a note with the following fields:

* `title`
* `content_json`

`content_json` must contain a valid TipTap JSON document.

### View Notes

A user can view a list of their own notes with basic metadata:

* title;
* creation date;
* last updated date;
* public/private status.

### View Single Note

A user can open a single note that belongs to them.

### Update Note

A user can update:

* title;
* `content_json`.

After every update, the system must update the `updated_at` field.

### Delete Note

A user can delete their own note.

### Acceptance Criteria

* A note cannot be created without authentication.
* Every note must belong to a specific user.
* A user cannot edit or delete another user's note.
* An empty title should either be rejected or automatically replaced with `Untitled Note`.
* Empty content is allowed.

---

## 5.3 Rich Text Editor

The editor must be implemented using **TipTap**.

Supported formatting:

* Bold;
* Italic;
* Heading level 1;
* Heading level 2;
* Heading level 3;
* Normal paragraph text;
* Inline code;
* Code block;
* Bullet list;
* Horizontal rule.

### Editor Toolbar

The toolbar should include buttons for:

* Bold;
* Italic;
* Paragraph;
* H1;
* H2;
* H3;
* Inline Code;
* Code Block;
* Bullet List;
* Horizontal Rule.

### Storage Format

The note content must be stored as TipTap JSON.

Example:

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Example note"
        }
      ]
    }
  ]
}
```

### Acceptance Criteria

* Formatting is preserved after a page reload.
* TipTap JSON is correctly saved to SQLite.
* Invalid JSON must not be saved to the database.
* The public note page must render the same formatted content in read-only mode.

---

## 5.4 Public Sharing

A user can make their own note publicly accessible.

A public note must be available through a URL like:

```txt
/share/:publicId
```

Alternative option:

```txt
/notes/public/:publicId
```

Recommended MVP route:

```txt
/share/:publicId
```

### Behavior

* If `is_public = true`, the note is accessible without authentication.
* If `is_public = false`, the public URL returns a 404 page or a message such as `This note is not available`.
* A public visitor must not see edit, delete, or sharing controls.
* The public page must be read-only.

### publicId / Share Token

The public URL must use a separate random identifier, not the database note ID.

```txt
public_id: string
```

Requirements:

* must be unique;
* must be hard to guess;
* must not expose the internal note ID;
* can be generated only when sharing is enabled for the first time.

### Acceptance Criteria

* A user can make a note public.
* A user can stop sharing a note.
* The public URL does not allow editing.
* After sharing is disabled, the public URL no longer shows the note content.

---

## 6. Non-Functional Requirements

### 6.1 Security

* All write API routes must check authentication.
* All private read, update, and delete operations must check note ownership.
* The public route must only return notes where `is_public = true`.
* The backend must not trust frontend input.
* SQL queries must use parameterized statements.
* Raw user input must not be interpolated directly into SQL strings.

### 6.2 Data Reliability

* `content_json` must be valid JSON.
* `created_at` and `updated_at` are required.
* `updated_at` must be changed on every update.
* For the MVP, deleting a note can permanently remove it from the database.

### 6.3 User Experience

* The interface should be simple and fast.
* Main actions should be clearly visible.
* Deleting a note requires confirmation.
* After saving, the user should receive feedback such as `Saved`, `Saving...`, or `Error saving note`.
* The sharing status of a note should be easy to understand.

### 6.4 Performance

For the MVP, the following is enough:

* server-side pagination or a simple limit for the notes list;
* indexes on `user_id`, `public_id`, and `updated_at`;
* avoiding unnecessary client-side requests.

---

## 7. Application Architecture

## 7.1 Recommended Folder Structure

```txt
app/
  page.tsx
  layout.tsx

  login/
    page.tsx

  register/
    page.tsx

  notes/
    page.tsx
    new/
      page.tsx
    [noteId]/
      page.tsx
      edit/
        page.tsx

  share/
    [publicId]/
      page.tsx

  api/
    auth/
      [...all]/
        route.ts
    notes/
      route.ts
      [noteId]/
        route.ts
      [noteId]/share/
        route.ts

components/
  auth/
    LoginForm.tsx
    RegisterForm.tsx
  notes/
    NoteCard.tsx
    NoteEditor.tsx
    NoteToolbar.tsx
    NotesList.tsx
    ShareControls.tsx
  ui/
    Button.tsx
    Input.tsx
    Modal.tsx

lib/
  auth.ts
  db.ts
  notes.ts
  validation.ts
  tiptap.ts
  utils.ts

db/
  schema.sql
  migrations/

types/
  note.ts
```

---

## 7.2 Routing

### Public Routes

```txt
/login
/register
/share/:publicId
```

### Protected Routes

```txt
/notes
/notes/new
/notes/:noteId
/notes/:noteId/edit
```

### API Routes

```txt
GET    /api/notes
POST   /api/notes
GET    /api/notes/:noteId
PATCH  /api/notes/:noteId
DELETE /api/notes/:noteId
POST   /api/notes/:noteId/share
DELETE /api/notes/:noteId/share
```

---

## 8. Database Schema

## 8.1 Users Table

The final structure of user, session, and account tables may depend on **better-auth**.

Do not manually duplicate the authentication schema if better-auth generates or expects its own tables.

The notes table must reference the user ID returned by better-auth.

---

## 8.2 Notes Table

```sql
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content_json TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 0,
  public_id TEXT UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_updated_at ON notes(user_id, updated_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_notes_public_id ON notes(public_id);
```

### Fields

| Field          |    Type | Description                                       |
| -------------- | ------: | ------------------------------------------------- |
| `id`           |    TEXT | Internal note ID, for example UUID or a random ID |
| `user_id`      |    TEXT | ID of the note owner                              |
| `title`        |    TEXT | Note title                                        |
| `content_json` |    TEXT | TipTap JSON stored as a string                    |
| `is_public`    | INTEGER | 0 or 1                                            |
| `public_id`    |    TEXT | Unique public sharing ID                          |
| `created_at`   |    TEXT | ISO datetime                                      |
| `updated_at`   |    TEXT | ISO datetime                                      |

---

## 9. API Specification

## 9.1 GET /api/notes

Returns the current user's notes.

### Auth

Required.

### Response 200

```json
{
  "notes": [
    {
      "id": "note_123",
      "title": "My note",
      "isPublic": false,
      "createdAt": "2026-01-01T10:00:00.000Z",
      "updatedAt": "2026-01-01T10:00:00.000Z"
    }
  ]
}
```

### Errors

* `401 Unauthorized`

---

## 9.2 POST /api/notes

Creates a new note.

### Auth

Required.

### Request Body

```json
{
  "title": "My note",
  "contentJson": {
    "type": "doc",
    "content": []
  }
}
```

### Response 201

```json
{
  "note": {
    "id": "note_123",
    "title": "My note",
    "contentJson": {
      "type": "doc",
      "content": []
    },
    "isPublic": false,
    "publicId": null,
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-01T10:00:00.000Z"
  }
}
```

### Errors

* `400 Bad Request`
* `401 Unauthorized`

---

## 9.3 GET /api/notes/:noteId

Returns a single note owned by the current user.

### Auth

Required.

### Response 200

```json
{
  "note": {
    "id": "note_123",
    "title": "My note",
    "contentJson": {
      "type": "doc",
      "content": []
    },
    "isPublic": false,
    "publicId": null,
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-01T10:00:00.000Z"
  }
}
```

### Errors

* `401 Unauthorized`
* `404 Not Found`

---

## 9.4 PATCH /api/notes/:noteId

Updates a note owned by the current user.

### Auth

Required.

### Request Body

```json
{
  "title": "Updated title",
  "contentJson": {
    "type": "doc",
    "content": []
  }
}
```

### Response 200

```json
{
  "note": {
    "id": "note_123",
    "title": "Updated title",
    "contentJson": {
      "type": "doc",
      "content": []
    },
    "isPublic": false,
    "publicId": null,
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-01T11:00:00.000Z"
  }
}
```

### Errors

* `400 Bad Request`
* `401 Unauthorized`
* `404 Not Found`

---

## 9.5 DELETE /api/notes/:noteId

Deletes a note owned by the current user.

### Auth

Required.

### Response 200

```json
{
  "success": true
}
```

### Errors

* `401 Unauthorized`
* `404 Not Found`

---

## 9.6 POST /api/notes/:noteId/share

Enables public sharing for a note.

### Auth

Required.

### Response 200

```json
{
  "note": {
    "id": "note_123",
    "isPublic": true,
    "publicId": "pub_abc123",
    "publicUrl": "https://example.com/share/pub_abc123"
  }
}
```

### Errors

* `401 Unauthorized`
* `404 Not Found`

---

## 9.7 DELETE /api/notes/:noteId/share

Disables public sharing for a note.

### Auth

Required.

### Response 200

```json
{
  "note": {
    "id": "note_123",
    "isPublic": false,
    "publicId": "pub_abc123"
  }
}
```

The `publicId` can remain in the database for reuse, but access must be blocked by `is_public = false`.

### Errors

* `401 Unauthorized`
* `404 Not Found`

---

## 9.8 GET /share/:publicId

Public page for viewing a shared note.

### Auth

Not required.

### Behavior

* Looks up the note by `public_id`.
* Shows the note only if `is_public = 1`.
* If the note does not exist or is not public, returns 404.

---

## 10. Data Access Layer

All SQLite access should be placed in `lib/notes.ts` or a similar module.

Recommended functions:

```ts
export async function getNotesByUserId(userId: string): Promise<NoteSummary[]>;
export async function getNoteByIdForUser(noteId: string, userId: string): Promise<Note | null>;
export async function createNote(input: CreateNoteInput): Promise<Note>;
export async function updateNote(input: UpdateNoteInput): Promise<Note | null>;
export async function deleteNote(noteId: string, userId: string): Promise<boolean>;
export async function enableNoteSharing(noteId: string, userId: string): Promise<Note | null>;
export async function disableNoteSharing(noteId: string, userId: string): Promise<Note | null>;
export async function getPublicNote(publicId: string): Promise<PublicNote | null>;
```

All SQL queries for private operations must verify `user_id`.

Example of an ownership-safe update:

```sql
UPDATE notes
SET title = ?, content_json = ?, updated_at = ?
WHERE id = ? AND user_id = ?;
```

---

## 11. Validation

Create a `lib/validation.ts` module.

### Note Title

* type: string;
* trim before saving;
* minimum: 1 character or fallback to `Untitled Note`;
* maximum: 200 characters.

### contentJson

* must be an object;
* root `type` must be `doc`;
* must be serializable with `JSON.stringify`;
* must be parsed with `JSON.parse` when reading from the database.

### publicId

* type: string;
* generated on the server;
* must not be accepted from the client request body.

---

## 12. UI Specification

## 12.1 Notes List Page

Route:

```txt
/notes
```

Elements:

* header with the application name;
* `New Note` button;
* list of note cards;
* empty state if the user has no notes;
* user menu or logout button.

Each note card shows:

* title;
* updated date;
* public/private badge;
* link to open the note.

---

## 12.2 Note Editor Page

Routes:

```txt
/notes/new
/notes/:noteId/edit
```

Elements:

* title input;
* TipTap editor;
* formatting toolbar;
* Save button;
* Delete button for an existing note;
* Share controls for an existing note;
* save status indicator.

---

## 12.3 Note View Page

Route:

```txt
/notes/:noteId
```

Elements:

* title;
* rendered rich text content;
* Edit button;
* Delete button;
* Share controls;
* link back to the notes list.

---

## 12.4 Public Note Page

Route:

```txt
/share/:publicId
```

Elements:

* title;
* rendered TipTap content;
* optional label: `Public note`;
* no edit controls.

---

## 13. Error States

The system must handle the following states:

* unauthenticated access;
* note not found;
* forbidden ownership access;
* invalid request body;
* database write failure;
* malformed content JSON;
* public note unavailable;
* failed login or registration.

Recommended UX messages:

```txt
You need to sign in to access your notes.
Note not found.
You do not have access to this note.
Could not save note. Please try again.
This public note is no longer available.
```

---

## 14. Security Checklist

Before finishing the MVP, verify that:

* [ ] all `/notes/*` pages are protected with an auth check;
* [ ] all `/api/notes/*` write routes are protected with an auth check;
* [ ] all SQL queries are parameterized;
* [ ] update/delete/select operations for private notes always include `user_id`;
* [ ] the public route filters by `is_public = 1`;
* [ ] `public_id` is not the database ID;
* [ ] the user cannot pass `userId`, `publicId`, or `isPublic` directly when creating a note;
* [ ] TipTap content is rendered without unsafe HTML injection;
* [ ] the delete action has a confirmation dialog.

---

## 15. Implementation Plan

### Phase 1: Project Setup

* Initialize the Next.js project with TypeScript.
* Configure Bun.
* Add TailwindCSS.
* Create the base folder structure.
* Add the base layout.

### Phase 2: Database

* Configure SQLite connection through Bun.
* Create the SQL schema.
* Add the notes table.
* Add indexes.
* Create helper functions for database access.

### Phase 3: Authentication

* Configure better-auth.
* Add login and registration pages.
* Add logout.
* Protect private routes.
* Protect API routes.

### Phase 4: Notes CRUD

* Implement notes listing.
* Implement note creation.
* Implement single note view.
* Implement note update.
* Implement note deletion.
* Add validation.

### Phase 5: TipTap Editor

* Add TipTap packages.
* Create the `NoteEditor` component.
* Add the formatting toolbar.
* Add JSON save/load logic.
* Add a read-only renderer.

### Phase 6: Public Sharing

* Add `public_id` generation.
* Implement the enable sharing endpoint.
* Implement the disable sharing endpoint.
* Implement the public note page.
* Add copy public URL UX.

### Phase 7: Polish and Testing

* Add loading states.
* Add error states.
* Test edge cases.
* Complete the security checklist.
* Clean up the UI.

---

## 16. Testing Checklist

### Authentication

* [ ] user can register;
* [ ] user can log in;
* [ ] user can log out;
* [ ] unauthenticated user cannot view `/notes`;
* [ ] unauthenticated API request returns 401.

### Notes

* [ ] user can create a note;
* [ ] user sees the created note in the list;
* [ ] user can open a note;
* [ ] user can edit the title;
* [ ] user can edit TipTap content;
* [ ] formatting is preserved after refresh;
* [ ] user can delete a note;
* [ ] user cannot access another user's note.

### Sharing

* [ ] user can make a note public;
* [ ] public URL opens without login;
* [ ] public URL shows read-only content;
* [ ] user can stop sharing;
* [ ] after sharing is disabled, the public URL no longer shows the note;
* [ ] public URL does not use the internal note ID.

---

## 17. Open Questions

Before development starts, clarify:

1. Which login method is required for the MVP: email/password, social login, or magic link?
2. Should the editor support autosave, or is a manual Save button enough?
3. Should deleted notes be hard deleted or soft deleted?
4. Should the notes list show a preview of the note content?
5. Should the title be a separate field or the first heading inside the TipTap editor?
6. Should public note pages be server-side rendered?
7. Are rate limits required for authentication and public endpoints?

---

## 18. Recommended MVP Defaults

To start development quickly, use the following defaults:

* Auth: email/password with better-auth.
* Save behavior: manual Save button.
* Delete behavior: hard delete.
* Title: separate `title` field.
* Public URL: `/share/:publicId`.
* Public ID: random token, not the database ID.
* Content storage: TipTap JSON serialized into a SQLite `TEXT` column.
* Rendering: TipTap read-only renderer for private view and public view.
* Styling: TailwindCSS without an additional UI library at the beginning.

---

## 19. Definition of Done for MVP

The MVP is complete when:

* the user can register, log in, and log out;
* an authenticated user can create, view, update, and delete their own notes;
* the TipTap editor supports the required formatting options;
* note content is stored in SQLite as JSON;
* the user can make a note public;
* a public note can be opened without login;
* the user can stop public sharing;
* private notes owned by other users are not accessible;
* basic errors and loading states are handled;
* the security checklist has been completed.
