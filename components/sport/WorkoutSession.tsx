"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { vibrate } from "@/lib/haptics";
import { useRestTimer, RestTimer } from "@/components/sport/RestTimer";
import { logSet, deleteSet, completeSession } from "@/app/(workout)/sport/workout/actions";

export type WorkoutExercise = {
  id: string;
  name: string;
  target_sets: number;
  target_reps: string;
};

export type LoggedSetView = {
  id: string;
  exercise_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
};

export type LastSetEntry = { set_number: number; weight_kg: number; reps: number };

export function WorkoutSession({
  sessionId,
  sessionTitle,
  exercises,
  initialSets,
  lastSets,
}: {
  sessionId: string;
  sessionTitle: string;
  exercises: WorkoutExercise[];
  initialSets: LoggedSetView[];
  lastSets: Record<string, LastSetEntry[]>;
}) {
  const router = useRouter();
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [sets, setSets] = useState(initialSets);
  const [isPending, startTransition] = useTransition();
  const timer = useRestTimer();

  const exercise = exercises[exerciseIndex];
  const exerciseSets = sets
    .filter((s) => s.exercise_id === exercise.id)
    .sort((a, b) => a.set_number - b.set_number);
  const nextSetNumber = exerciseSets.length + 1;

  const prefill = useMemo(() => {
    const history = lastSets[exercise.id] ?? [];
    return (
      history.find((s) => s.set_number === nextSetNumber) ??
      history[history.length - 1] ??
      null
    );
  }, [lastSets, exercise.id, nextSetNumber]);

  const [weight, setWeight] = useState<string>(prefill ? String(prefill.weight_kg) : "");
  const [reps, setReps] = useState<string>(prefill ? String(prefill.reps) : "");

  function goToExercise(index: number) {
    setExerciseIndex(index);
    const nextExercise = exercises[index];
    const nextExerciseSets = sets.filter((s) => s.exercise_id === nextExercise.id);
    const nextSetNum = nextExerciseSets.length + 1;
    const history = lastSets[nextExercise.id] ?? [];
    const pre =
      history.find((s) => s.set_number === nextSetNum) ?? history[history.length - 1] ?? null;
    setWeight(pre ? String(pre.weight_kg) : "");
    setReps(pre ? String(pre.reps) : "");
  }

  function handleCompleteSet() {
    const weightNum = Number(weight);
    const repsNum = Number(reps);
    if (!weightNum && weightNum !== 0) return;
    if (!repsNum) return;

    vibrate(15);

    const formData = new FormData();
    formData.set("exercise_id", exercise.id);
    formData.set("set_number", String(nextSetNumber));
    formData.set("weight_kg", String(weightNum));
    formData.set("reps", String(repsNum));

    const optimisticId = `optimistic-${Date.now()}`;
    setSets((current) => [
      ...current,
      {
        id: optimisticId,
        exercise_id: exercise.id,
        set_number: nextSetNumber,
        weight_kg: weightNum,
        reps: repsNum,
      },
    ]);
    timer.start();

    startTransition(async () => {
      const result = await logSet(sessionId, formData);
      if (!result.success) {
        toast.error(result.error);
        setSets((current) => current.filter((s) => s.id !== optimisticId));
        return;
      }
      setSets((current) =>
        current.map((s) => (s.id === optimisticId ? { ...s, id: result.data.setId } : s))
      );
      if (result.data.isPR) {
        toast.success(`Nieuw persoonlijk record! Geschat 1RM: ${result.data.estimated1RM} kg`, {
          icon: <Trophy className="size-4" />,
        });
      }
    });
  }

  function handleDeleteSet(setId: string) {
    setSets((current) => current.filter((s) => s.id !== setId));
    startTransition(async () => {
      const result = await deleteSet(setId, sessionId);
      if (!result.success) toast.error(result.error);
    });
  }

  function handleFinish() {
    startTransition(async () => {
      const result = await completeSession(sessionId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Workout afgerond. Goed gedaan!");
      router.push("/sport");
    });
  }

  const isLastExercise = exerciseIndex === exercises.length - 1;

  return (
    <div className="flex min-h-svh flex-col">
      <div className="safe-top flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-xs text-muted-foreground">{sessionTitle}</p>
          <p className="text-xs text-muted-foreground">
            Oefening {exerciseIndex + 1} van {exercises.length}
          </p>
        </div>
        <button
          type="button"
          onClick={handleFinish}
          aria-label="Workout afronden"
          className="flex h-11 items-center gap-1.5 rounded-[12px] border border-border px-3 text-sm font-medium"
        >
          <X className="size-4" />
          Afronden
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-6 px-4 pb-32">
        <div className="flex flex-col items-center gap-1 pt-4 text-center">
          <h1 className="font-heading text-3xl font-bold">{exercise.name}</h1>
          <p className="text-sm text-muted-foreground">
            Doel: {exercise.target_sets} x {exercise.target_reps}
          </p>
        </div>

        {exerciseSets.length > 0 && (
          <div className="flex flex-col gap-2">
            {exerciseSets.map((set) => (
              <div
                key={set.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3"
              >
                <span className="text-sm font-medium">Set {set.set_number}</span>
                <span className="tabular-nums">
                  {set.weight_kg} kg × {set.reps}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteSet(set.id)}
                  aria-label="Set verwijderen"
                  className="flex size-9 items-center justify-center text-muted-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4">
          <p className="text-center text-sm font-medium text-muted-foreground">
            Set {nextSetNumber}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="weight" className="text-center text-xs text-muted-foreground">
                kg
              </label>
              <Input
                id="weight"
                type="number"
                inputMode="decimal"
                step="any"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="h-16 rounded-[12px] text-center text-2xl font-bold tabular-nums"
              />
            </div>
            <span className="pt-5 text-xl text-muted-foreground">×</span>
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="reps" className="text-center text-xs text-muted-foreground">
                reps
              </label>
              <Input
                id="reps"
                type="number"
                inputMode="numeric"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="h-16 rounded-[12px] text-center text-2xl font-bold tabular-nums"
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={handleCompleteSet}
            disabled={isPending}
            className="h-14 rounded-[12px] text-lg"
          >
            Set voltooien
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={exerciseIndex === 0}
            onClick={() => goToExercise(exerciseIndex - 1)}
            className="h-12 flex-1 gap-1.5 rounded-[12px] text-base"
          >
            <ChevronLeft className="size-4" />
            Vorige
          </Button>
          {isLastExercise ? (
            <Button
              type="button"
              onClick={handleFinish}
              className="h-12 flex-1 rounded-[12px] text-base"
            >
              Workout afronden
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => goToExercise(exerciseIndex + 1)}
              className="h-12 flex-1 gap-1.5 rounded-[12px] text-base"
            >
              Volgende
              <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {timer.isRunning && (
        <RestTimer remaining={timer.remaining} onAdjust={timer.adjust} onStop={timer.stop} />
      )}
    </div>
  );
}
