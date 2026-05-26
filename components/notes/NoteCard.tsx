import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { NoteSummary } from "@/types/note";

interface NoteCardProps {
  note: NoteSummary;
}

export function NoteCard({ note }: NoteCardProps) {
  return (
    <Link
      href={`/notes/${note.id}`}
      className="group block rounded-xl border border-gray-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors line-clamp-2">
          {note.title}
        </h3>
        {note.isPublic && (
          <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
            Public
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-gray-400">
        Updated {formatDate(note.updatedAt)}
      </p>
    </Link>
  );
}
