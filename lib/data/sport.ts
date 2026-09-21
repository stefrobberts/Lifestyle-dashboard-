import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { nextScheduleInRotation, estimateOneRepMax, groupVolumeByMuscleGroup } from "@/lib/sport";
import { dateKey } from "@/lib/date";

type Client = SupabaseClient<Database>;

const SEED_EXERCISES: { name: string; muscle_group: string }[] = [
  { name: "Bankdrukken", muscle_group: "borst" },
  { name: "Schuine bankdrukken", muscle_group: "borst" },
  { name: "Push-ups", muscle_group: "borst" },
  { name: "Dips", muscle_group: "borst" },
  { name: "Deadlift", muscle_group: "rug" },
  { name: "Optrekken", muscle_group: "rug" },
  { name: "Rows", muscle_group: "rug" },
  { name: "Lat pulldown", muscle_group: "rug" },
  { name: "Face pulls", muscle_group: "rug" },
  { name: "Squat", muscle_group: "benen" },
  { name: "Beenpers", muscle_group: "benen" },
  { name: "Uitvalspas", muscle_group: "benen" },
  { name: "Romanian deadlift", muscle_group: "benen" },
  { name: "Kuitheffen", muscle_group: "benen" },
  { name: "Overhead press", muscle_group: "schouders" },
  { name: "Zijwaartse heffingen", muscle_group: "schouders" },
  { name: "Rear delt fly", muscle_group: "schouders" },
  { name: "Biceps curls", muscle_group: "armen" },
  { name: "Triceps pushdown", muscle_group: "armen" },
  { name: "Close-grip bankdrukken", muscle_group: "armen" },
  { name: "Planken", muscle_group: "buik" },
  { name: "Sit-ups", muscle_group: "buik" },
];

const SEED_SCHEDULES: {
  title: string;
  exercises: { name: string; sets: number; reps: string }[];
}[] = [
  {
    title: "Push",
    exercises: [
      { name: "Bankdrukken", sets: 4, reps: "8-12" },
      { name: "Schuine bankdrukken", sets: 3, reps: "10-12" },
      { name: "Overhead press", sets: 4, reps: "8-10" },
      { name: "Zijwaartse heffingen", sets: 3, reps: "12-15" },
      { name: "Triceps pushdown", sets: 3, reps: "12-15" },
      { name: "Dips", sets: 3, reps: "8-12" },
    ],
  },
  {
    title: "Pull",
    exercises: [
      { name: "Optrekken", sets: 4, reps: "6-10" },
      { name: "Rows", sets: 4, reps: "8-12" },
      { name: "Lat pulldown", sets: 3, reps: "10-12" },
      { name: "Face pulls", sets: 3, reps: "15-20" },
      { name: "Biceps curls", sets: 3, reps: "10-12" },
    ],
  },
  {
    title: "Legs",
    exercises: [
      { name: "Squat", sets: 4, reps: "6-10" },
      { name: "Romanian deadlift", sets: 3, reps: "8-10" },
      { name: "Beenpers", sets: 3, reps: "10-12" },
      { name: "Uitvalspas", sets: 3, reps: "10 per been" },
      { name: "Kuitheffen", sets: 4, reps: "12-15" },
    ],
  },
];

/**
 * Vult de app bij de eerste keer met een voorbeeld-oefeningenbibliotheek en
 * een Push/Pull/Legs-schema. Race-veilig via een conditionele update op
 * `sample_sport_seeded`, zelfde patroon als `ensureDefaultRecipes`.
 */
export async function ensureDefaultSportData(supabase: Client, userId: string) {
  const { data: claimed } = await supabase
    .from("user_settings")
    .update({ sample_sport_seeded: true })
    .eq("user_id", userId)
    .eq("sample_sport_seeded", false)
    .select("id");

  if (!claimed || claimed.length === 0) return;

  const { data: insertedExercises, error: exercisesError } = await supabase
    .from("exercises")
    .insert(SEED_EXERCISES.map((e) => ({ user_id: userId, ...e })))
    .select("id, name");

  if (exercisesError || !insertedExercises) return;

  const exerciseId = (name: string) => insertedExercises.find((e) => e.name === name)!.id;

  for (const [scheduleIndex, schedule] of SEED_SCHEDULES.entries()) {
    const { data: insertedSchedule } = await supabase
      .from("workout_schedules")
      .insert({ user_id: userId, title: schedule.title, sort_order: scheduleIndex })
      .select("id")
      .single();

    if (!insertedSchedule) continue;

    await supabase.from("schedule_exercises").insert(
      schedule.exercises.map((ex, index) => ({
        user_id: userId,
        schedule_id: insertedSchedule.id,
        exercise_id: exerciseId(ex.name),
        sort_order: index,
        target_sets: ex.sets,
        target_reps: ex.reps,
      }))
    );
  }
}

export async function fetchExercises(supabase: Client) {
  const { data } = await supabase
    .from("exercises")
    .select("*")
    .order("muscle_group", { ascending: true })
    .order("name", { ascending: true });
  return data ?? [];
}

export async function fetchSchedules(supabase: Client) {
  const { data } = await supabase
    .from("workout_schedules")
    .select("*, schedule_exercises(*, exercises(*))")
    .order("sort_order", { ascending: true });

  return (data ?? []).map((schedule) => ({
    ...schedule,
    schedule_exercises: schedule.schedule_exercises.sort(
      (a, b) => a.sort_order - b.sort_order
    ),
  }));
}

export async function fetchScheduleDetail(supabase: Client, scheduleId: string) {
  const { data } = await supabase
    .from("workout_schedules")
    .select("*, schedule_exercises(*, exercises(*))")
    .eq("id", scheduleId)
    .maybeSingle();

  if (!data) return null;

  return {
    ...data,
    schedule_exercises: data.schedule_exercises.sort((a, b) => a.sort_order - b.sort_order),
  };
}

/** Bepaalt het schema voor "de workout van vandaag" op basis van de laatst afgeronde sessie. */
export async function fetchTodaysSchedule(supabase: Client) {
  const [{ data: schedules }, { data: lastSession }] = await Promise.all([
    supabase.from("workout_schedules").select("id, sort_order, title"),
    supabase
      .from("workout_sessions")
      .select("schedule_id")
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!schedules || schedules.length === 0) return null;

  const next = nextScheduleInRotation(schedules, lastSession?.schedule_id ?? null);
  if (!next) return null;

  return schedules.find((s) => s.id === next.id) ?? null;
}

/** Meest recente gelogde set per oefening (voor "vorige keer"-invulling), gegroepeerd per set_number. */
export async function fetchLastSetsForExercises(supabase: Client, exerciseIds: string[]) {
  if (exerciseIds.length === 0) return new Map<string, { set_number: number; weight_kg: number; reps: number }[]>();

  const { data } = await supabase
    .from("workout_sets")
    .select("exercise_id, set_number, weight_kg, reps, completed_at, session_id")
    .in("exercise_id", exerciseIds)
    .order("completed_at", { ascending: false })
    .limit(200);

  const result = new Map<string, { set_number: number; weight_kg: number; reps: number }[]>();
  const seenSessionByExercise = new Map<string, string>();

  for (const row of data ?? []) {
    const lockedSession = seenSessionByExercise.get(row.exercise_id);
    if (lockedSession && lockedSession !== row.session_id) continue;
    if (!lockedSession) seenSessionByExercise.set(row.exercise_id, row.session_id);

    const list = result.get(row.exercise_id) ?? [];
    list.push({ set_number: row.set_number, weight_kg: row.weight_kg, reps: row.reps });
    result.set(row.exercise_id, list);
  }

  for (const list of result.values()) {
    list.sort((a, b) => a.set_number - b.set_number);
  }

  return result;
}

/** Beste geschat 1RM tot nu toe, per oefening. */
export async function fetchBestEst1RmByExercise(supabase: Client) {
  const { data } = await supabase
    .from("workout_sets")
    .select("exercise_id, weight_kg, reps");

  const best = new Map<string, number>();
  for (const row of data ?? []) {
    const est1RM = Math.round(row.weight_kg * (1 + row.reps / 30) * 10) / 10;
    const current = best.get(row.exercise_id) ?? 0;
    if (est1RM > current) best.set(row.exercise_id, est1RM);
  }
  return best;
}

/** Geschat 1RM per sessie voor één oefening (voor de progressiegrafiek). */
export async function fetchProgressionForExercise(supabase: Client, exerciseId: string) {
  const { data } = await supabase
    .from("workout_sets")
    .select("weight_kg, reps, completed_at")
    .eq("exercise_id", exerciseId)
    .order("completed_at", { ascending: true });

  const bySessionDate = new Map<string, number>();
  for (const row of data ?? []) {
    const day = dateKey(new Date(row.completed_at));
    const est1RM = estimateOneRepMax(row.weight_kg, row.reps);
    const current = bySessionDate.get(day) ?? 0;
    if (est1RM > current) bySessionDate.set(day, est1RM);
  }

  return Array.from(bySessionDate.entries())
    .map(([date, est1RM]) => ({ date, est1RM }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Dagen in een maand waarop een workout is afgerond (voor de kalender). */
export async function fetchWorkoutDaysInMonth(supabase: Client, year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);

  const { data } = await supabase
    .from("workout_sessions")
    .select("completed_at")
    .not("completed_at", "is", null)
    .gte("completed_at", start.toISOString())
    .lt("completed_at", end.toISOString());

  return new Set((data ?? []).map((s) => dateKey(new Date(s.completed_at!))));
}

/** Trainingsvolume van de afgelopen 7 dagen, per spiergroep. */
export async function fetchWeeklyVolumeByMuscleGroup(supabase: Client) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [{ data: sets }, exercises] = await Promise.all([
    supabase
      .from("workout_sets")
      .select("exercise_id, weight_kg, reps")
      .gte("completed_at", weekAgo.toISOString()),
    fetchExercises(supabase),
  ]);

  return groupVolumeByMuscleGroup(sets ?? [], exercises);
}
