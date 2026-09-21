import { createClient } from "@/lib/supabase/server";
import { fetchExercises } from "@/lib/data/sport";
import { AddExerciseSheet } from "@/components/sport/AddExerciseSheet";

const MUSCLE_GROUP_LABELS: Record<string, string> = {
  borst: "Borst",
  rug: "Rug",
  benen: "Benen",
  schouders: "Schouders",
  armen: "Armen",
  buik: "Buik",
};

export default async function OefeningenPage() {
  const supabase = await createClient();
  const exercises = await fetchExercises(supabase);

  const byMuscleGroup = new Map<string, typeof exercises>();
  for (const exercise of exercises) {
    const list = byMuscleGroup.get(exercise.muscle_group) ?? [];
    list.push(exercise);
    byMuscleGroup.set(exercise.muscle_group, list);
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Oefeningen</h1>
        <AddExerciseSheet />
      </div>

      {exercises.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nog geen oefeningen. Voeg je eerste oefening toe.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {Object.entries(MUSCLE_GROUP_LABELS).map(([key, label]) => {
            const list = byMuscleGroup.get(key);
            if (!list || list.length === 0) return null;
            return (
              <div key={key} className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {label}
                </h3>
                <div className="flex flex-col gap-2">
                  {list.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex min-h-11 items-center rounded-2xl border border-border bg-card px-4 py-3 text-sm"
                    >
                      {exercise.name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
