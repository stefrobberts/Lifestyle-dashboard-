import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { fetchLinkedinIdeas, fetchUnprocessedInboxCount } from "@/lib/data/work";
import { WerkTabs } from "@/components/werk/WerkTabs";
import { LinkedinIdeaCard } from "@/components/werk/LinkedinIdeaCard";
import { ContentCalendar } from "@/components/werk/ContentCalendar";

export default async function LinkedinPage() {
  const supabase = await createClient();
  const [ideas, inboxCount] = await Promise.all([
    fetchLinkedinIdeas(supabase),
    fetchUnprocessedInboxCount(supabase),
  ]);

  const now = new Date();
  const plannedByDay = new Map<string, string[]>();
  for (const idea of ideas) {
    if (!idea.planned_date) continue;
    const list = plannedByDay.get(idea.planned_date) ?? [];
    list.push(idea.subject);
    plannedByDay.set(idea.planned_date, list);
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <h1 className="font-heading text-2xl font-bold">Werk</h1>
      <WerkTabs active="/werk/linkedin" inboxCount={inboxCount} />

      <ContentCalendar year={now.getFullYear()} month={now.getMonth()} plannedByDay={plannedByDay} />

      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base font-semibold">LinkedIn-ideeën</h2>
        <Link
          href="/werk/linkedin/nieuw"
          className="flex h-9 items-center gap-1.5 rounded-[10px] bg-primary px-3 text-sm font-medium text-primary-foreground"
        >
          <Plus className="size-4" />
          Nieuw
        </Link>
      </div>

      {ideas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Nog geen ideeën. Leg er eentje vast, ook al is het maar één zin.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {ideas.map((idea) => (
            <LinkedinIdeaCard
              key={idea.id}
              id={idea.id}
              subject={idea.subject}
              status={idea.status}
              plannedDate={idea.planned_date}
            />
          ))}
        </div>
      )}
    </div>
  );
}
