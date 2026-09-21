import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { fetchSchedules } from "@/lib/data/sport";
import { ScheduleCard } from "@/components/sport/ScheduleCard";

export default async function SchemasPage() {
  const supabase = await createClient();
  const schedules = await fetchSchedules(supabase);

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Schema&apos;s</h1>
        <Link
          href="/sport/schemas/nieuw"
          className="flex h-11 items-center gap-1.5 rounded-[12px] bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          <Plus className="size-4" />
          Nieuw
        </Link>
      </div>

      {schedules.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nog geen schema&apos;s. Maak je eerste trainingsschema, bijvoorbeeld
            Push, Pull of Legs.
          </p>
          <Link
            href="/sport/schemas/nieuw"
            className="flex h-11 items-center gap-1.5 rounded-[12px] bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            <Plus className="size-4" />
            Schema toevoegen
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {schedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              id={schedule.id}
              title={schedule.title}
              exerciseCount={schedule.schedule_exercises.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
