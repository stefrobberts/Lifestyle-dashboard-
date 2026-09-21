"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { scheduleSchema } from "@/lib/validations/sport";

type ActionResult = { success: true } | { success: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Niet ingelogd.");
  return { supabase, user };
}

function parseScheduleForm(formData: FormData) {
  const exercisesRaw = formData.get("exercises_json");
  let exercises: unknown = [];
  try {
    exercises = exercisesRaw ? JSON.parse(String(exercisesRaw)) : [];
  } catch {
    exercises = [];
  }

  return scheduleSchema.safeParse({
    title: formData.get("title"),
    exercises,
  });
}

export async function createSchedule(formData: FormData): Promise<ActionResult> {
  const parsed = parseScheduleForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { supabase, user } = await requireUser();

  const { count } = await supabase
    .from("workout_schedules")
    .select("id", { count: "exact", head: true });

  const { data: schedule, error } = await supabase
    .from("workout_schedules")
    .insert({ user_id: user.id, title: parsed.data.title, sort_order: count ?? 0 })
    .select("id")
    .single();

  if (error || !schedule) {
    return { success: false, error: "Aanmaken is niet gelukt." };
  }

  const { error: exercisesError } = await supabase.from("schedule_exercises").insert(
    parsed.data.exercises.map((ex, index) => ({
      user_id: user.id,
      schedule_id: schedule.id,
      exercise_id: ex.exercise_id,
      sort_order: index,
      target_sets: ex.target_sets,
      target_reps: ex.target_reps,
    }))
  );

  if (exercisesError) {
    return { success: false, error: "Oefeningen opslaan is niet gelukt." };
  }

  revalidatePath("/sport");
  redirect("/sport/schemas");
}

export async function updateSchedule(
  scheduleId: string,
  formData: FormData
): Promise<ActionResult> {
  const parsed = parseScheduleForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("workout_schedules")
    .update({ title: parsed.data.title })
    .eq("id", scheduleId);

  if (error) {
    return { success: false, error: "Opslaan is niet gelukt." };
  }

  await supabase.from("schedule_exercises").delete().eq("schedule_id", scheduleId);
  const { error: exercisesError } = await supabase.from("schedule_exercises").insert(
    parsed.data.exercises.map((ex, index) => ({
      user_id: user.id,
      schedule_id: scheduleId,
      exercise_id: ex.exercise_id,
      sort_order: index,
      target_sets: ex.target_sets,
      target_reps: ex.target_reps,
    }))
  );

  if (exercisesError) {
    return { success: false, error: "Oefeningen opslaan is niet gelukt." };
  }

  revalidatePath("/sport");
  revalidatePath("/sport/schemas");
  redirect("/sport/schemas");
}

export async function deleteSchedule(scheduleId: string): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("workout_schedules")
    .delete()
    .eq("id", scheduleId);

  if (error) {
    return { success: false, error: "Verwijderen is niet gelukt." };
  }

  revalidatePath("/sport");
  revalidatePath("/sport/schemas");
  return { success: true };
}

const SEED_SCHEDULE_TITLES = ["Push", "Pull", "Legs"];
const SEED_EXERCISE_NAMES = [
  "Bankdrukken",
  "Schuine bankdrukken",
  "Push-ups",
  "Dips",
  "Deadlift",
  "Optrekken",
  "Rows",
  "Lat pulldown",
  "Face pulls",
  "Squat",
  "Beenpers",
  "Uitvalspas",
  "Romanian deadlift",
  "Kuitheffen",
  "Overhead press",
  "Zijwaartse heffingen",
  "Rear delt fly",
  "Biceps curls",
  "Triceps pushdown",
  "Close-grip bankdrukken",
  "Planken",
  "Sit-ups",
];

/** Wist de voorbeeldschema's en -oefeningen. Oefeningen die je zelf al in een
 * eigen schema of workout gebruikt, blijven staan (kunnen niet verwijderd
 * worden zolang ze in gebruik zijn). */
export async function clearSampleSportData(): Promise<ActionResult> {
  const { supabase } = await requireUser();

  await supabase.from("workout_schedules").delete().in("title", SEED_SCHEDULE_TITLES);

  for (const name of SEED_EXERCISE_NAMES) {
    await supabase.from("exercises").delete().eq("name", name);
  }

  revalidatePath("/sport");
  revalidatePath("/sport/schemas");
  revalidatePath("/sport/oefeningen");
  return { success: true };
}
