import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchLastSetsForExercises } from "@/lib/data/sport";
import {
  WorkoutSession,
  type LastSetEntry,
  type LoggedSetView,
  type WorkoutExercise,
} from "@/components/sport/WorkoutSession";

export default async function WorkoutPage(props: PageProps<"/sport/workout/[sessionId]">) {
  const { sessionId } = await props.params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("workout_sessions")
    .select("*, workout_schedules(schedule_exercises(*, exercises(*)))")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session) notFound();
  if (session.completed_at) redirect("/sport");

  const scheduleExercises = (session.workout_schedules?.schedule_exercises ?? []).sort(
    (a, b) => a.sort_order - b.sort_order
  );

  if (scheduleExercises.length === 0) redirect("/sport");

  const exercises: WorkoutExercise[] = scheduleExercises.map((se) => ({
    id: se.exercise_id,
    name: se.exercises!.name,
    target_sets: se.target_sets,
    target_reps: se.target_reps,
  }));

  const { data: existingSets } = await supabase
    .from("workout_sets")
    .select("id, exercise_id, set_number, weight_kg, reps")
    .eq("session_id", sessionId)
    .order("set_number", { ascending: true });

  const lastSetsMap = await fetchLastSetsForExercises(
    supabase,
    exercises.map((e) => e.id)
  );
  const lastSets: Record<string, LastSetEntry[]> = Object.fromEntries(lastSetsMap);

  return (
    <WorkoutSession
      sessionId={session.id}
      sessionTitle={session.title}
      exercises={exercises}
      initialSets={(existingSets ?? []) as LoggedSetView[]}
      lastSets={lastSets}
    />
  );
}
