import { getDb } from "./db";
import { generateId, generatePublicId, now } from "./utils";
import { validateTitle, validateContentJson } from "./validation";
import type {
  Note,
  NoteSummary,
  PublicNote,
  CreateNoteInput,
  UpdateNoteInput,
} from "@/types/note";

interface NoteRow {
  id: string;
  user_id: string;
  title: string;
  content_json: string;
  is_public: number;
  public_id: string | null;
  created_at: string;
  updated_at: string;
}

function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    contentJson: JSON.parse(row.content_json),
    isPublic: row.is_public === 1,
    publicId: row.public_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToSummary(row: NoteRow): NoteSummary {
  return {
    id: row.id,
    title: row.title,
    isPublic: row.is_public === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getNotesByUserId(userId: string): NoteSummary[] {
  const db = getDb();
  const rows = db
    .query<NoteRow, [string]>(
      `SELECT id, user_id, title, content_json, is_public, public_id, created_at, updated_at
       FROM notes
       WHERE user_id = ?
       ORDER BY updated_at DESC
       LIMIT 100`
    )
    .all(userId);
  return rows.map(rowToSummary);
}

export function getNoteByIdForUser(
  noteId: string,
  userId: string
): Note | null {
  const db = getDb();
  const row = db
    .query<NoteRow, [string, string]>(
      `SELECT id, user_id, title, content_json, is_public, public_id, created_at, updated_at
       FROM notes
       WHERE id = ? AND user_id = ?`
    )
    .get(noteId, userId);
  return row ? rowToNote(row) : null;
}

export function createNote(input: CreateNoteInput): Note {
  const db = getDb();
  const id = generateId("note");
  const title = validateTitle(input.title);
  const contentJson = validateContentJson(input.contentJson);
  const ts = now();

  db.run(
    `INSERT INTO notes (id, user_id, title, content_json, is_public, public_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, NULL, ?, ?)`,
    [id, input.userId, title, JSON.stringify(contentJson), ts, ts]
  );

  return getNoteByIdForUser(id, input.userId)!;
}

export function updateNote(input: UpdateNoteInput): Note | null {
  const db = getDb();
  const existing = getNoteByIdForUser(input.noteId, input.userId);
  if (!existing) return null;

  const title =
    input.title !== undefined ? validateTitle(input.title) : existing.title;
  const contentJson =
    input.contentJson !== undefined
      ? validateContentJson(input.contentJson)
      : existing.contentJson;
  const ts = now();

  db.run(
    `UPDATE notes
     SET title = ?, content_json = ?, updated_at = ?
     WHERE id = ? AND user_id = ?`,
    [title, JSON.stringify(contentJson), ts, input.noteId, input.userId]
  );

  return getNoteByIdForUser(input.noteId, input.userId);
}

export function deleteNote(noteId: string, userId: string): boolean {
  const db = getDb();
  const result = db.run(
    `DELETE FROM notes WHERE id = ? AND user_id = ?`,
    [noteId, userId]
  );
  return result.changes > 0;
}

export function enableNoteSharing(
  noteId: string,
  userId: string
): Note | null {
  const db = getDb();
  const existing = getNoteByIdForUser(noteId, userId);
  if (!existing) return null;

  // Reuse existing publicId if present
  const publicId = existing.publicId ?? generatePublicId();

  db.run(
    `UPDATE notes SET is_public = 1, public_id = ?, updated_at = ? WHERE id = ? AND user_id = ?`,
    [publicId, now(), noteId, userId]
  );

  return getNoteByIdForUser(noteId, userId);
}

export function disableNoteSharing(
  noteId: string,
  userId: string
): Note | null {
  const db = getDb();
  const existing = getNoteByIdForUser(noteId, userId);
  if (!existing) return null;

  db.run(
    `UPDATE notes SET is_public = 0, updated_at = ? WHERE id = ? AND user_id = ?`,
    [now(), noteId, userId]
  );

  return getNoteByIdForUser(noteId, userId);
}

export function getPublicNote(publicId: string): PublicNote | null {
  const db = getDb();
  const row = db
    .query<NoteRow, [string]>(
      `SELECT id, user_id, title, content_json, is_public, public_id, created_at, updated_at
       FROM notes
       WHERE public_id = ? AND is_public = 1`
    )
    .get(publicId);

  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    contentJson: JSON.parse(row.content_json),
  };
}
