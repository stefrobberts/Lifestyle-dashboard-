"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exerciseSchema } from "@/lib/validations/sport";

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

export async function createExercise(
  formData: FormData
): Promise<ActionResult<{ exerciseId: string }>> {
  const parsed = exerciseSchema.safeParse({
    name: formData.get("name"),
    muscle_group: formData.get("muscle_group"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { supabase, user } = await requireUser();

  const { data: inserted, error } = await supabase
    .from("exercises")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      muscle_group: parsed.data.muscle_group,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return { success: false, error: "Aanmaken is niet gelukt." };
  }

  revalidatePath("/sport/oefeningen");
  return { success: true, data: { exerciseId: inserted.id } };
}
