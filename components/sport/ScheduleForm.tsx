"use client";

import { useActionState, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchInput } from "@/components/shared/SearchInput";

type ExerciseOption = { id: string; name: string; muscle_group: string };

type ScheduleExerciseRow = {
  exercise_id: string;
  name: string;
  target_sets: number;
  target_reps: string;
};

type FormState = { status: "idle" | "error"; message?: string };

export function ScheduleForm({
  mode,
  allExercises,
  initialValues,
  action,
}: {
  mode: "create" | "edit";
  allExercises: ExerciseOption[];
  initialValues?: { title: string; exercises: ScheduleExerciseRow[] };
  action: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}) {
  const [exercises, setExercises] = useState<ScheduleExerciseRow[]>(
    initialValues?.exercises ?? []
  );
  const [query, setQuery] = useState("");

  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      formData.set(
        "exercises_json",
        JSON.stringify(
          exercises.map((e) => ({
            exercise_id: e.exercise_id,
            target_sets: e.target_sets,
            target_reps: e.target_reps,
          }))
        )
      );
      const result = await action(formData);
      if (!result.success) {
        return { status: "error", message: result.error };
      }
      return { status: "idle" };
    },
    { status: "idle" }
  );

  const searchResults = useMemo(() => {
    if (query.trim().length < 1) return [];
    const chosen = new Set(exercises.map((e) => e.exercise_id));
    const q = query.trim().toLowerCase();
    return allExercises
      .filter((e) => !chosen.has(e.id) && e.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, allExercises, exercises]);

  function addExercise(exercise: ExerciseOption) {
    setExercises((current) => [
      ...current,
      { exercise_id: exercise.id, name: exercise.name, target_sets: 3, target_reps: "8-12" },
    ]);
    setQuery("");
  }

  function updateExercise(index: number, patch: Partial<ScheduleExerciseRow>) {
    setExercises((current) =>
      current.map((e, i) => (i === index ? { ...e, ...patch } : e))
    );
  }

  function removeExercise(index: number) {
    setExercises((current) => current.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6 px-4 pb-24">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Titel</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={initialValues?.title}
          placeholder="Bijv. Push"
          className="h-11 rounded-[12px] text-base"
        />
      </div>

      <div className="flex flex-col gap-3">
        <Label>Oefeningen</Label>

        {exercises.length > 0 && (
          <div className="flex flex-col gap-2">
            {exercises.map((exercise, index) => (
              <div
                key={`${exercise.exercise_id}-${index}`}
                className="flex flex-col gap-2 rounded-2xl border border-border bg-card px-3 py-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{exercise.name}</span>
                  <button
                    type="button"
                    onClick={() => removeExercise(index)}
                    aria-label="Verwijder oefening"
                    className="flex size-9 items-center justify-center text-muted-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-1 items-center gap-1.5">
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={exercise.target_sets}
                      onChange={(e) =>
                        updateExercise(index, { target_sets: Number(e.target.value) || 1 })
                      }
                      className="h-9 rounded-[10px] text-sm"
                    />
                    <span className="text-xs text-muted-foreground">sets</span>
                  </div>
                  <div className="flex flex-1 items-center gap-1.5">
                    <Input
                      value={exercise.target_reps}
                      onChange={(e) => updateExercise(index, { target_reps: e.target.value })}
                      placeholder="8-12"
                      className="h-9 rounded-[10px] text-sm"
                    />
                    <span className="text-xs text-muted-foreground">reps</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <SearchInput value={query} onChange={setQuery} placeholder="Zoek een oefening…" />

        {searchResults.length > 0 && (
          <div className="flex flex-col gap-2">
            {searchResults.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                onClick={() => addExercise(exercise)}
                className="flex min-h-11 items-center gap-2 rounded-2xl border border-dashed border-border px-3 py-2 text-left text-sm"
              >
                <Plus className="size-4 text-primary" />
                {exercise.name}
                <span className="text-xs text-muted-foreground">{exercise.muscle_group}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending || exercises.length === 0}
        className="h-11 rounded-[12px] text-base"
      >
        {isPending
          ? "Bezig met opslaan…"
          : mode === "create"
            ? "Schema opslaan"
            : "Wijzigingen opslaan"}
      </Button>
    </form>
  );
}
