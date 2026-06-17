"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NoteEditor } from "./NoteEditor";
import { ShareControls } from "./ShareControls";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { emptyDoc } from "@/lib/validation";
import type { Note } from "@/types/note";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface NoteEditorPageProps {
  note?: Note;
}

export function NoteEditorPage({ note }: NoteEditorPageProps) {
  const router = useRouter();
  const isNew = !note;

  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState<object>(
    note?.contentJson ?? emptyDoc()
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [sharing, setSharing] = useState(note?.isPublic ?? false);
  const [publicId, setPublicId] = useState<string | null>(note?.publicId ?? null);

  const handleContentChange = useCallback((json: object) => {
    setContent(json);
    setSaveStatus("idle");
  }, []);

  async function handleSave() {
    setSaveStatus("saving");
    try {
      if (isNew) {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title || "Untitled Note", contentJson: content }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSaveStatus("saved");
        router.replace(`/notes/${data.note.id}/edit`);
      } else {
        const res = await fetch(`/api/notes/${note.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title || "Untitled Note", contentJson: content }),
        });
        if (!res.ok) throw new Error();
        setSaveStatus("saved");
      }
    } catch {
      setSaveStatus("error");
    }
  }

  async function handleDelete() {
    if (!note) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/notes");
        router.refresh();
      }
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
    }
  }

  const statusLabel: Record<SaveStatus, string> = {
    idle: "",
    saving: "Saving…",
    saved: "Saved ✓",
    error: "Error saving",
  };

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

          <div className="flex items-center gap-3">
            {saveStatus !== "idle" && (
              <span
                className={[
                  "text-xs font-medium px-2.5 py-1 rounded-full",
                  saveStatus === "error"
                    ? "bg-terracotta-soft text-terracotta-deep"
                    : saveStatus === "saved"
                    ? "bg-sage-soft text-sage-ink"
                    : "bg-raised text-ink-soft",
                ].join(" ")}
              >
                {statusLabel[saveStatus]}
              </span>
            )}

            {!isNew && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                Delete
              </Button>
            )}

            <Button variant="primary" size="sm" onClick={handleSave} loading={saveStatus === "saving"}>
              Save
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Note"
          className="w-full text-3xl font-bold text-ink bg-transparent border-none outline-none placeholder:text-ink-faint"
        />

        <NoteEditor
          content={content}
          onChange={handleContentChange}
          className="shadow-xs"
        />

        {!isNew && (
          <ShareControls
            noteId={note.id}
            isPublic={sharing}
            publicId={publicId}
            onChanged={(isPublic, pid) => {
              setSharing(isPublic);
              setPublicId(pid);
            }}
          />
        )}
      </main>

      <Modal
        open={deleteOpen}
        title="Delete note"
        description="This action cannot be undone. The note will be permanently deleted."
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
