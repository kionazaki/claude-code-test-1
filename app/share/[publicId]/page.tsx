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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <span className="text-sm font-medium text-gray-500">📝 Notes</span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">
            Public note
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">{note.title}</h1>
        <NoteEditor content={note.contentJson} readOnly className="shadow-sm" />
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
