"use client";

import { useState } from "react";
import { NotesList } from "./NotesList";
import { NoteModal } from "./NoteModal";
import { LogoutButton } from "@/components/auth/LogoutButton";
import type { NoteSummary } from "@/types/note";

interface NotesPageClientProps {
  notes: NoteSummary[];
  userName: string;
}

export function NotesPageClient({ notes, userName }: NotesPageClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const openNote = (noteId: string) => {
    setActiveNoteId(noteId);
    setModalOpen(true);
  };

  const openNew = () => {
    setActiveNoteId(null);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-[#0d0d0d]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#9a9a00] flex items-center justify-center">
              <span className="text-black text-xs font-bold leading-none">✦</span>
            </div>
            <span className="font-semibold text-zinc-100">Notes</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">
              {userName}
            </span>
            <button
              onClick={openNew}
              className="rounded-xl bg-[#9a9a00] px-3 py-1.5 text-sm font-medium text-black hover:bg-[#b5b500] transition-colors"
            >
              + New Note
            </button>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <NotesList notes={notes} onNoteClick={openNote} onNewNote={openNew} />
      </main>

      <NoteModal
        noteId={activeNoteId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
