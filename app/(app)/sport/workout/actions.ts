"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logSetSchema } from "@/lib/validations/sport";
import { estimateOneRepMax, isPersonalRecord } from "@/lib/sport";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Niet ingelogd.");
  return { supabase, user };
}

export async function logSet(
  sessionId: string,
  formData: FormData
): Promise<ActionResult<{ setId: string; isPR: boolean; estimated1RM: number }>> {
  const parsed = logSetSchema.safeParse({
    exercise_id: formData.get("exercise_id"),
    set_number: formData.get("set_number"),
    weight_kg: formData.get("weight_kg"),
    reps: formData.get("reps"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { supabase, user } = await requireUser();

  const { data: previousSets } = await supabase
    .from("workout_sets")
    .select("weight_kg, reps")
    .eq("exercise_id", parsed.data.exercise_id);

  const previousBest = (previousSets ?? []).reduce<number | null>((best, s) => {
    const est = estimateOneRepMax(s.weight_kg, s.reps);
    return best === null || est > best ? est : best;
  }, null);

  const { data: inserted, error } = await supabase
    .from("workout_sets")
    .insert({
      user_id: user.id,
      session_id: sessionId,
      exercise_id: parsed.data.exercise_id,
      set_number: parsed.data.set_number,
      weight_kg: parsed.data.weight_kg,
      reps: parsed.data.reps,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return { success: false, error: "Opslaan is niet gelukt." };
  }

  const estimated1RM = estimateOneRepMax(parsed.data.weight_kg, parsed.data.reps);
  const isPR = isPersonalRecord(parsed.data, previousBest);

  revalidatePath(`/sport/workout/${sessionId}`);
  return { success: true, data: { setId: inserted.id, isPR, estimated1RM } };
}

export async function deleteSet(setId: string, sessionId: string): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const { error } = await supabase.from("workout_sets").delete().eq("id", setId);

  if (error) {
    return { success: false, error: "Verwijderen is niet gelukt." };
  }

  revalidatePath(`/sport/workout/${sessionId}`);
  return { success: true, data: undefined };
}

export async function completeSession(sessionId: string): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("workout_sessions")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", sessionId);

  if (error) {
    return { success: false, error: "Afronden is niet gelukt." };
  }

  revalidatePath("/sport");
  revalidatePath("/vandaag");
  return { success: true, data: undefined };
}
