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
      <header className="sticky top-0 z-10 border-b border-line bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber flex items-center justify-center">
              <span className="text-ink text-xs font-bold leading-none">✦</span>
            </div>
            <span className="font-semibold text-ink">Notes</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-ink-soft bg-raised px-3 py-1 rounded-full">
              {userName}
            </span>
            <button
              onClick={openNew}
              className="rounded-xl bg-amber px-3 py-1.5 text-sm font-medium text-ink hover:bg-amber-deep transition-colors"
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
