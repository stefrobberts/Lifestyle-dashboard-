import { createClient } from "@/lib/supabase/server";
import { fetchUnprocessedInboxCount, fetchWorkNotes } from "@/lib/data/work";
import { WerkTabs } from "@/components/werk/WerkTabs";
import { NotesSection } from "@/components/werk/NotesSection";

export default async function NotitiesPage() {
  const supabase = await createClient();
  const [notes, inboxCount] = await Promise.all([
    fetchWorkNotes(supabase),
    fetchUnprocessedInboxCount(supabase),
  ]);

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <h1 className="font-heading text-2xl font-bold">Werk</h1>
      <WerkTabs active="/werk/notities" inboxCount={inboxCount} />
      <NotesSection
        initialNotes={notes.map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          tags: n.tags,
        }))}
      />
    </div>
  );
}
