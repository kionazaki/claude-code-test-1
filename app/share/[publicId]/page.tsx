import { notFound } from "next/navigation";
import { getPublicNote } from "@/lib/notes";
import { NoteEditor } from "@/components/notes/NoteEditor";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ publicId: string }>;
}

export default async function PublicNotePage({ params }: Props) {
  const { publicId } = await params;
  const note = getPublicNote(publicId);

  if (!note) notFound();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-line bg-cream">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber flex items-center justify-center">
              <span className="text-ink text-xs font-bold leading-none">✦</span>
            </div>
            <span className="text-sm font-semibold text-ink">Notes</span>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-soft text-terracotta-deep">
            Public note
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-ink">{note.title}</h1>
        <NoteEditor content={note.contentJson} readOnly className="shadow-xs" />
      </main>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { publicId } = await params;
  const note = getPublicNote(publicId);
  return {
    title: note ? note.title : "Note not found",
  };
}
