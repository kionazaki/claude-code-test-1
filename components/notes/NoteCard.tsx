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
      className="group block w-full text-left rounded-2xl ring-1 ring-zinc-950/5 bg-white p-5 hover:ring-violet-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-zinc-900 group-hover:text-violet-700 transition-colors line-clamp-2">
          {note.title}
        </h3>
        {note.isPublic && (
          <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            Public
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-zinc-400">
        Updated {formatDate(note.updatedAt)}
      </p>
    </button>
  );
}
