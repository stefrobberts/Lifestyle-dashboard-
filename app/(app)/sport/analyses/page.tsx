import Link from "next/link";
import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  fetchBestEst1RmByExercise,
  fetchExercises,
  fetchProgressionForExercise,
  fetchWeeklyVolumeByMuscleGroup,
  fetchWorkoutDaysInMonth,
} from "@/lib/data/sport";
import { cn } from "@/lib/utils";
import { ProgressionChart } from "@/components/sport/ProgressionChart";
import { WorkoutCalendar } from "@/components/sport/WorkoutCalendar";

const MUSCLE_GROUP_LABELS: Record<string, string> = {
  borst: "Borst",
  rug: "Rug",
  benen: "Benen",
  schouders: "Schouders",
  armen: "Armen",
  buik: "Buik",
};

export default async function AnalysesPage(props: PageProps<"/sport/analyses">) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  const exercises = await fetchExercises(supabase);
  const selectedExerciseId =
    typeof searchParams.oefening === "string" ? searchParams.oefening : exercises[0]?.id;

  const now = new Date();
  const [bestByExercise, volumeByMuscleGroup, workoutDays, progression] = await Promise.all([
    fetchBestEst1RmByExercise(supabase),
    fetchWeeklyVolumeByMuscleGroup(supabase),
    fetchWorkoutDaysInMonth(supabase, now.getFullYear(), now.getMonth()),
    selectedExerciseId
      ? fetchProgressionForExercise(supabase, selectedExerciseId)
      : Promise.resolve([]),
  ]);

  const personalRecords = exercises
    .map((e) => ({ name: e.name, est1RM: bestByExercise.get(e.id) }))
    .filter((r): r is { name: string; est1RM: number } => r.est1RM !== undefined)
    .sort((a, b) => b.est1RM - a.est1RM);

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <h1 className="font-heading text-2xl font-bold">Analyses</h1>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Progressie
        </h2>
        {exercises.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nog geen oefeningen om progressie voor te tonen.
          </p>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {exercises.map((exercise) => (
                <Link
                  key={exercise.id}
                  href={`/sport/analyses?oefening=${exercise.id}`}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-2 text-sm font-medium",
                    exercise.id === selectedExerciseId
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {exercise.name}
                </Link>
              ))}
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              {progression.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nog geen sets gelogd voor deze oefening.
                </p>
              ) : (
                <ProgressionChart data={progression} />
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Persoonlijke records
        </h2>
        {personalRecords.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nog geen records. Log je eerste set om te beginnen.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {personalRecords.slice(0, 8).map((record) => (
              <div
                key={record.name}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
              >
                <Trophy className="size-4 shrink-0 text-warning" />
                <span className="flex-1 text-sm font-medium">{record.name}</span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {record.est1RM} kg
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Volume deze week per spiergroep
        </h2>
        {Object.keys(volumeByMuscleGroup).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nog geen trainingsvolume deze week.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(MUSCLE_GROUP_LABELS).map(([key, label]) => {
              const volume = volumeByMuscleGroup[key];
              if (!volume) return null;
              return (
                <div
                  key={key}
                  className="flex flex-col gap-1 rounded-2xl border border-border bg-card px-4 py-3"
                >
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="font-heading text-lg font-bold tabular-nums">
                    {Math.round(volume).toLocaleString("nl-NL")} kg
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Trainingsdagen
        </h2>
        <WorkoutCalendar
          year={now.getFullYear()}
          month={now.getMonth()}
          workoutDays={workoutDays}
        />
      </div>
    </div>
  );
}
