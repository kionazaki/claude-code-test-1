"use client";

import { NoteCard } from "./NoteCard";
import type { NoteSummary } from "@/types/note";

interface NotesListProps {
  notes: NoteSummary[];
  onNoteClick: (noteId: string) => void;
  onNewNote: () => void;
}

export function NotesList({ notes, onNoteClick, onNewNote }: NotesListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#2a2a00] flex items-center justify-center mb-5">
          <span className="text-[#c8c800] text-2xl font-bold leading-none">✦</span>
        </div>
        <h2 className="text-lg font-semibold text-zinc-200">No notes yet</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Create your first note to get started.
        </p>
        <button
          onClick={onNewNote}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#9a9a00] px-4 py-2 text-sm font-medium text-black hover:bg-[#b5b500] transition-colors"
        >
          + New Note
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} onClick={() => onNoteClick(note.id)} />
      ))}
    </div>
  );
}
