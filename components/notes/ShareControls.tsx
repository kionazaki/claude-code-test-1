"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface ShareControlsProps {
  noteId: string;
  isPublic: boolean;
  publicId: string | null;
  onChanged?: (isPublic: boolean, publicId: string | null) => void;
}

export function ShareControls({
  noteId,
  isPublic,
  publicId,
  onChanged,
}: ShareControlsProps) {
  const [sharing, setSharing] = useState(isPublic);
  const [pid, setPid] = useState<string | null>(publicId);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // window is not available during SSR — use env var as fallback
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");

  const publicUrl = pid ? `${origin}/share/${pid}` : null;

  async function handleEnable() {
    setLoading(true);
    try {
      const res = await fetch(`/api/notes/${noteId}/share`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSharing(true);
        setPid(data.note.publicId);
        onChanged?.(true, data.note.publicId);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    setLoading(true);
    try {
      const res = await fetch(`/api/notes/${noteId}/share`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSharing(false);
        onChanged?.(false, pid);
      }
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl ring-1 ring-zinc-700 bg-zinc-900 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-200">Public sharing</p>
          <p className="text-xs text-zinc-500">
            {sharing
              ? "Anyone with the link can view this note."
              : "Only you can see this note."}
          </p>
        </div>
        <span
          className={[
            "text-xs font-semibold px-2.5 py-1 rounded-full",
            sharing
              ? "bg-[#1a2a1a] text-emerald-400"
              : "bg-zinc-800 text-zinc-400",
          ].join(" ")}
        >
          {sharing ? "Public" : "Private"}
        </span>
      </div>

      {sharing && publicUrl && (
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={publicUrl}
            className="flex-1 text-xs rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-300 truncate"
          />
          <Button size="sm" variant="secondary" onClick={copyLink}>
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        {sharing ? (
          <Button
            variant="secondary"
            size="sm"
            loading={loading}
            onClick={handleDisable}
          >
            Stop sharing
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            loading={loading}
            onClick={handleEnable}
          >
            Share publicly
          </Button>
        )}
      </div>
    </div>
  );
}
