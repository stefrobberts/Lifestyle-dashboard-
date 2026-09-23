"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { measurementSchema, quickWeightSchema } from "@/lib/validations/measurements";
import { upsertMeasurement, quickLogWeight } from "@/lib/data/measurements";

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

function optionalField(formData: FormData, name: string) {
  return formData.get(name) || undefined;
}

export async function saveMeasurement(formData: FormData): Promise<ActionResult> {
  const parsed = measurementSchema.safeParse({
    measured_at: formData.get("measured_at"),
    weight_kg: optionalField(formData, "weight_kg"),
    body_fat_percentage: optionalField(formData, "body_fat_percentage"),
    waist_cm: optionalField(formData, "waist_cm"),
    chest_cm: optionalField(formData, "chest_cm"),
    hips_cm: optionalField(formData, "hips_cm"),
    arm_cm: optionalField(formData, "arm_cm"),
    notes: optionalField(formData, "notes"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { supabase, user } = await requireUser();
  const { error } = await upsertMeasurement(supabase, user.id, parsed.data);

  if (error) {
    return { success: false, error: "Opslaan is niet gelukt." };
  }

  revalidatePath("/meer/metingen");
  revalidatePath("/vandaag");
  return { success: true, data: undefined };
}

export async function deleteMeasurement(measurementId: string): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("body_measurements")
    .delete()
    .eq("id", measurementId);

  if (error) {
    return { success: false, error: "Verwijderen is niet gelukt." };
  }

  revalidatePath("/meer/metingen");
  revalidatePath("/vandaag");
  return { success: true, data: undefined };
}

/** Voor de FAB-sneltegel "Gewicht invoeren": alleen het gewicht van vandaag. */
export async function quickSaveWeight(formData: FormData): Promise<ActionResult> {
  const parsed = quickWeightSchema.safeParse({ weight_kg: formData.get("weight_kg") });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { supabase, user } = await requireUser();
  const { error } = await quickLogWeight(supabase, user.id, parsed.data.weight_kg);

  if (error) {
    return { success: false, error: "Opslaan is niet gelukt." };
  }

  revalidatePath("/meer/metingen");
  revalidatePath("/vandaag");
  return { success: true, data: undefined };
}

// Zelfde vaste gewichten als in ensureSampleMeasurements, zodat de voorbeelddata
// hier herkenbaar en dus wisbaar is zonder per ongeluk echte metingen te raken.
const SEED_WEIGHTS = [83.4, 82.9, 82.6, 82.1, 81.8];

/** Wist alle voorbeeldmetingen. */
export async function clearSampleMeasurements(): Promise<ActionResult> {
  const { supabase } = await requireUser();

  await supabase.from("body_measurements").delete().in("weight_kg", SEED_WEIGHTS);

  revalidatePath("/meer/metingen");
  revalidatePath("/vandaag");
  return { success: true, data: undefined };
}
