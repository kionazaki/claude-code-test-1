import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getNoteByIdForUser, updateNote, deleteNote } from "@/lib/notes";
import { validateContentJson, validateTitle } from "@/lib/validation";

interface Params {
  params: Promise<{ noteId: string }>;
}

// GET /api/notes/:noteId
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { noteId } = await params;
  const note = getNoteByIdForUser(noteId, session.user.id);
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json({ note });
}

// PATCH /api/notes/:noteId
export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { title: rawTitle, contentJson: rawContent } = body as Record<
    string,
    unknown
  >;

  const { noteId } = await params;

  const input: { noteId: string; userId: string; title?: string; contentJson?: object } = {
    noteId,
    userId: session.user.id,
  };

  if (rawTitle !== undefined) {
    input.title = validateTitle(rawTitle);
  }

  if (rawContent !== undefined) {
    try {
      input.contentJson = validateContentJson(rawContent);
    } catch (err) {
      return NextResponse.json(
        { error: (err as Error).message },
        { status: 400 }
      );
    }
  }

  const note = updateNote(input);
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json({ note });
}

// DELETE /api/notes/:noteId
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { noteId } = await params;
  const deleted = deleteNote(noteId, session.user.id);
  if (!deleted) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
