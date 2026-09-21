import Link from "next/link";
import { BarChart3, ChevronRight, Dumbbell, ListChecks, Play } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensureDefaultData } from "@/lib/data/vandaag";
import { ensureDefaultSportData, fetchSchedules, fetchTodaysSchedule } from "@/lib/data/sport";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { startWorkout } from "@/app/(app)/sport/actions";

export default async function SportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  await ensureDefaultData(supabase, user.id);
  await ensureDefaultSportData(supabase, user.id);

  const [todaysSchedule, schedules] = await Promise.all([
    fetchTodaysSchedule(supabase),
    fetchSchedules(supabase),
  ]);

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Sport</h1>
        <Link
          href="/sport/analyses"
          className="flex h-11 items-center gap-1.5 rounded-[12px] border border-border px-3 text-sm font-medium text-muted-foreground"
        >
          <BarChart3 className="size-4" />
          Analyses
        </Link>
      </div>

      {todaysSchedule ? (
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Dumbbell className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Workout van vandaag</p>
                <p className="font-heading text-lg font-semibold">{todaysSchedule.title}</p>
              </div>
            </div>
            <form action={startWorkout.bind(null, todaysSchedule.id, todaysSchedule.title)}>
              <Button
                type="submit"
                className="h-12 w-full gap-1.5 rounded-[12px] text-base"
              >
                <Play className="size-4" />
                Workout starten
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Nog geen schema&apos;s. Maak er een om workouts te kunnen starten.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-heading text-base font-semibold">Schema&apos;s</h2>
          <Link
            href="/sport/schemas"
            className="text-xs font-medium text-muted-foreground"
          >
            Beheren
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
            >
              <span className="flex-1 text-sm font-medium">{schedule.title}</span>
              <span className="text-xs text-muted-foreground">
                {schedule.schedule_exercises.length} oefeningen
              </span>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/sport/oefeningen"
        className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-card px-4"
      >
        <div className="flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <ListChecks className="size-4" />
        </div>
        <span className="flex-1 text-sm font-medium">Oefeningenbibliotheek</span>
        <ChevronRight className="size-4 text-muted-foreground" />
      </Link>
    </div>
  );
}
