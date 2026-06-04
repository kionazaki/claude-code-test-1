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
      className="group block w-full text-left rounded-2xl ring-1 ring-white/5 bg-zinc-900 p-5 hover:ring-[#9a9a00]/60 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-zinc-100 group-hover:text-[#c8c800] transition-colors line-clamp-2">
          {note.title}
        </h3>
        {note.isPublic && (
          <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-[#1a2a1a] text-emerald-400">
            Public
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        Updated {formatDate(note.updatedAt)}
      </p>
    </button>
  );
}
