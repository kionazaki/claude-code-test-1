import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getNotesByUserId } from "@/lib/notes";
import { NotesPageClient } from "@/components/notes/NotesPageClient";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const notes = getNotesByUserId(session.user.id);

  return (
    <NotesPageClient
      notes={notes}
      userName={session.user.name ?? session.user.email}
    />
  );
}
