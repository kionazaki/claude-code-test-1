import Link from "next/link";
import { NoteCard } from "./NoteCard";
import type { NoteSummary } from "@/types/note";

interface NotesListProps {
  notes: NoteSummary[];
}

export function NotesList({ notes }: NotesListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4">📝</div>
        <h2 className="text-lg font-semibold text-gray-700">No notes yet</h2>
        <p className="text-sm text-gray-400 mt-1">
          Create your first note to get started.
        </p>
        <Link
          href="/notes/new"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          + New Note
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
