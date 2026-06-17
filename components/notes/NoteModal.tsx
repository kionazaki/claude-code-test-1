"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { NoteEditor } from "./NoteEditor";
import { ShareControls } from "./ShareControls";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { emptyDoc } from "@/lib/validation";
import type { Note } from "@/types/note";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface NoteModalProps {
  noteId: string | null;
  open: boolean;
  onClose: () => void;
}

const ANIM_MS = 220;

export function NoteModal({ noteId, open, onClose }: NoteModalProps) {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<object>(emptyDoc());
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [sharing, setSharing] = useState(false);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // mounted = whether to render into DOM; entered = whether to apply "open" CSS classes
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      const raf = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setEntered(false);
      const t = setTimeout(() => setMounted(false), ANIM_MS);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (noteId === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNote(null);
      setTitle("");
      setContent(emptyDoc());
      setSaveStatus("idle");
      setSharing(false);
      setPublicId(null);
      return;
    }
    setLoading(true);
    fetch(`/api/notes/${noteId}`)
      .then((r) => r.json())
      .then(({ note: n }: { note: Note }) => {
        setNote(n);
        setTitle(n.title);
        setContent(n.contentJson);
        setSharing(n.isPublic);
        setPublicId(n.publicId);
      })
      .finally(() => setLoading(false));
  }, [open, noteId]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      if (note === null) {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title || "Untitled Note", contentJson: content }),
        });
        if (!res.ok) throw new Error();
        const { note: created } = await res.json();
        setNote(created);
      } else {
        const res = await fetch(`/api/notes/${note.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title || "Untitled Note", contentJson: content }),
        });
        if (!res.ok) throw new Error();
      }
      setSaveStatus("saved");
      router.refresh();
    } catch {
      setSaveStatus("error");
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
        onClose();
      }
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
    }
  };

  if (!mounted) return null;

  const statusLabel: Record<SaveStatus, string> = {
    idle: "",
    saving: "Saving…",
    saved: "Saved ✓",
    error: "Error saving",
  };

  return createPortal(
    <>
      <div
        className={[
          "fixed inset-0 z-50 flex items-center justify-center p-4",
          "transition-[background-color] duration-[220ms] ease-out",
          entered ? "bg-ink/35" : "bg-ink/0",
        ].join(" ")}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className={[
            "relative flex flex-col w-full max-w-3xl max-h-[90vh] bg-surface rounded-2xl shadow-2xl overflow-hidden ring-1 ring-line",
            "transition-all duration-[220ms] ease-out",
            entered ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-3",
          ].join(" ")}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-3 border-b border-line shrink-0">
            <div>
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
            </div>
            <div className="flex items-center gap-2">
              {note && (
                <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
                  Delete
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                loading={saveStatus === "saving"}
              >
                Save
              </Button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-raised transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-sm text-ink-faint">
                Loading…
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setSaveStatus("idle");
                  }}
                  placeholder="Untitled Note"
                  className="w-full text-3xl font-bold text-ink bg-transparent border-none outline-none placeholder:text-ink-faint"
                />
                <NoteEditor
                  content={content}
                  onChange={(json) => {
                    setContent(json);
                    setSaveStatus("idle");
                  }}
                />
                {note && (
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
              </>
            )}
          </div>
        </div>
      </div>

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
    </>,
    document.body
  );
}
