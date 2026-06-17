import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getNoteByIdForUser } from "@/lib/notes";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { ShareControls } from "@/components/notes/ShareControls";
import { formatDate } from "@/lib/utils";
import { DeleteNoteButton } from "@/components/notes/DeleteNoteButton";

interface Props {
  params: Promise<{ noteId: string }>;
}

export const dynamic = "force-dynamic";

export default async function NoteViewPage({ params }: Props) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { noteId } = await params;
  const note = getNoteByIdForUser(noteId, session.user.id);
  if (!note) notFound();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-line bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link
            href="/notes"
            className="flex items-center gap-1.5 text-sm text-ink-faint hover:text-ink transition-colors"
          >
            <span>←</span>
            <span>Notes</span>
          </Link>
          <div className="flex items-center gap-2">
            <DeleteNoteButton noteId={note.id} />
            <Link
              href={`/notes/${note.id}/edit`}
              className="rounded-xl bg-amber px-3 py-1.5 text-sm font-medium text-ink hover:bg-amber-deep transition-colors"
            >
              Edit
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-ink">{note.title}</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Updated {formatDate(note.updatedAt)}
          </p>
        </div>

        <NoteEditor content={note.contentJson} readOnly className="shadow-xs" />

        <ShareControls
          noteId={note.id}
          isPublic={note.isPublic}
          publicId={note.publicId}
        />
      </main>
    </div>
  );
}
