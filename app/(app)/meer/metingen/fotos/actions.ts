"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { dateKey } from "@/lib/date";

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

async function findWeightForDate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  todayKey: string
) {
  const { data } = await supabase
    .from("body_measurements")
    .select("weight_kg")
    .eq("measured_at", todayKey)
    .maybeSingle();
  return data?.weight_kg ?? null;
}

/** Maakt en uploadt een progressiefoto, gebruikt zowel door het volledige formulier als de FAB-sneltegel. */
export async function createProgressPhoto(formData: FormData): Promise<ActionResult> {
  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) {
    return { success: false, error: "Kies eerst een foto." };
  }

  const { supabase, user } = await requireUser();
  const takenAt = (formData.get("taken_at") as string) || dateKey(new Date());

  const { data: inserted, error: insertError } = await supabase
    .from("progress_photos")
    .insert({ user_id: user.id, taken_at: takenAt, photo_path: "" })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return { success: false, error: "Aanmaken is niet gelukt." };
  }

  const extension = photo.name.split(".").pop() || "jpg";
  const path = `${user.id}/${inserted.id}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("progress-photos")
    .upload(path, photo, { upsert: true, contentType: photo.type });

  if (uploadError) {
    await supabase.from("progress_photos").delete().eq("id", inserted.id);
    return { success: false, error: "Uploaden is niet gelukt." };
  }

  const weightKg = await findWeightForDate(supabase, takenAt);

  await supabase
    .from("progress_photos")
    .update({ photo_path: path, weight_kg: weightKg })
    .eq("id", inserted.id);

  revalidatePath("/meer/metingen/fotos");
  return { success: true, data: undefined };
}

export async function deleteProgressPhoto(photoId: string, photoPath: string): Promise<ActionResult> {
  const { supabase } = await requireUser();

  await supabase.storage.from("progress-photos").remove([photoPath]);

  const { error } = await supabase.from("progress_photos").delete().eq("id", photoId);

  if (error) {
    return { success: false, error: "Verwijderen is niet gelukt." };
  }

  revalidatePath("/meer/metingen/fotos");
  return { success: true, data: undefined };
}
