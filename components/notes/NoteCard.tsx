import { formatDate } from "@/lib/utils";
import type { NoteSummary } from "@/types/note";

interface NoteCardProps {
  note: NoteSummary;
  onClick: () => void;
}

export function NoteCard({ note, onClick }: NoteCardProps) {
  return (
    <button
      onClick={onClick}
      className="group block w-full text-left rounded-2xl ring-1 ring-line bg-surface p-5 hover:ring-amber/60 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-ink group-hover:text-terracotta-deep transition-colors line-clamp-2">
          {note.title}
        </h3>
        {note.isPublic && (
          <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-sage-soft text-sage-ink">
            Public
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-ink-faint">
        Updated {formatDate(note.updatedAt)}
      </p>
    </button>
  );
}
