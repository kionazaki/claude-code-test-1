import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { enableNoteSharing, disableNoteSharing } from "@/lib/notes";

interface Params {
  params: Promise<{ noteId: string }>;
}

// POST /api/notes/:noteId/share — enable sharing
export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { noteId } = await params;
  const note = enableNoteSharing(noteId, session.user.id);
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const baseUrl =
    process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const publicUrl = note.publicId
    ? `${baseUrl}/share/${note.publicId}`
    : null;

  return NextResponse.json({
    note: {
      id: note.id,
      isPublic: note.isPublic,
      publicId: note.publicId,
      publicUrl,
    },
  });
}

// DELETE /api/notes/:noteId/share — disable sharing
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { noteId } = await params;
  const note = disableNoteSharing(noteId, session.user.id);
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json({
    note: {
      id: note.id,
      isPublic: note.isPublic,
      publicId: note.publicId,
    },
  });
}
