import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getNoteByIdForUser } from "@/lib/notes";
import { NoteEditorPage } from "@/components/notes/NoteEditorPage";

interface Props {
  params: Promise<{ noteId: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditNotePage({ params }: Props) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { noteId } = await params;
  const note = getNoteByIdForUser(noteId, session.user.id);
  if (!note) notFound();

  return <NoteEditorPage note={note} />;
}
