import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getNotesByUserId, createNote } from "@/lib/notes";
import { validateContentJson, validateTitle, emptyDoc } from "@/lib/validation";

// GET /api/notes
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notes = getNotesByUserId(session.user.id);
  return NextResponse.json({ notes });
}

// POST /api/notes
export async function POST(request: NextRequest) {
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

  let contentJson: object;
  try {
    contentJson = rawContent !== undefined
      ? validateContentJson(rawContent)
      : emptyDoc();
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }

  const title = validateTitle(rawTitle);

  const note = createNote({
    userId: session.user.id,
    title,
    contentJson,
  });

  return NextResponse.json({ note }, { status: 201 });
}
