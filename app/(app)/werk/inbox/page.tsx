import { createClient } from "@/lib/supabase/server";
import { fetchUnprocessedInboxCount, fetchUnprocessedInboxNotes } from "@/lib/data/work";
import { WerkTabs } from "@/components/werk/WerkTabs";
import { InboxList } from "@/components/werk/InboxList";

export default async function InboxPage() {
  const supabase = await createClient();
  const [items, inboxCount] = await Promise.all([
    fetchUnprocessedInboxNotes(supabase),
    fetchUnprocessedInboxCount(supabase),
  ]);

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <h1 className="font-heading text-2xl font-bold">Werk</h1>
      <WerkTabs active="/werk/inbox" inboxCount={inboxCount} />
      <InboxList
        initialItems={items.map((i) => ({
          id: i.id,
          content: i.content,
          createdAt: i.created_at,
        }))}
      />
    </div>
  );
}
