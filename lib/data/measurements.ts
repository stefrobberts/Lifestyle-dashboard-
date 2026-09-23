import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { dateKey } from "@/lib/date";

type Client = SupabaseClient<Database>;

/** Vult Metingen bij de eerste keer met een paar voorbeelden verspreid over de laatste maand. */
export async function ensureSampleMeasurements(supabase: Client, userId: string) {
  const { data: claimed } = await supabase
    .from("user_settings")
    .update({ sample_measurements_seeded: true })
    .eq("user_id", userId)
    .eq("sample_measurements_seeded", false)
    .select("id");

  if (!claimed || claimed.length === 0) return;

  const today = new Date();
  const daysAgo = (n: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() - n);
    return dateKey(date);
  };

  const { error } = await supabase.from("body_measurements").insert([
    {
      user_id: userId,
      measured_at: daysAgo(28),
      weight_kg: 83.4,
      body_fat_percentage: 19.5,
      waist_cm: 88,
      chest_cm: 102,
      hips_cm: 98,
      arm_cm: 34,
      notes: null,
    },
    {
      user_id: userId,
      measured_at: daysAgo(21),
      weight_kg: 82.9,
      body_fat_percentage: null,
      waist_cm: null,
      chest_cm: null,
      hips_cm: null,
      arm_cm: null,
      notes: null,
    },
    {
      user_id: userId,
      measured_at: daysAgo(14),
      weight_kg: 82.6,
      body_fat_percentage: 19.1,
      waist_cm: 87,
      chest_cm: null,
      hips_cm: null,
      arm_cm: null,
      notes: null,
    },
    {
      user_id: userId,
      measured_at: daysAgo(7),
      weight_kg: 82.1,
      body_fat_percentage: null,
      waist_cm: null,
      chest_cm: null,
      hips_cm: null,
      arm_cm: null,
      notes: null,
    },
    {
      user_id: userId,
      measured_at: daysAgo(1),
      weight_kg: 81.8,
      body_fat_percentage: 18.6,
      waist_cm: 86,
      chest_cm: 101,
      hips_cm: 97,
      arm_cm: 34.5,
      notes: "Voelt al wat strakker.",
    },
  ]);
  if (error) console.error("ensureSampleMeasurements: metingen seeden mislukt", error);
}

export async function fetchMeasurements(supabase: Client, sinceKey?: string) {
  let request = supabase
    .from("body_measurements")
    .select("*")
    .order("measured_at", { ascending: false });

  if (sinceKey) {
    request = request.gte("measured_at", sinceKey);
  }

  const { data } = await request;
  return data ?? [];
}

export async function fetchLatestMeasurement(supabase: Client) {
  const { data } = await supabase
    .from("body_measurements")
    .select("*")
    .order("measured_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

/** De twee laatste metingen die het opgegeven veld ingevuld hebben, voor de delta op Vandaag. */
export async function fetchRecentWeights(supabase: Client, limit: number) {
  const { data } = await supabase
    .from("body_measurements")
    .select("measured_at, weight_kg")
    .not("weight_kg", "is", null)
    .order("measured_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function upsertMeasurement(
  supabase: Client,
  userId: string,
  values: {
    measured_at: string;
    weight_kg?: number;
    body_fat_percentage?: number;
    waist_cm?: number;
    chest_cm?: number;
    hips_cm?: number;
    arm_cm?: number;
    notes?: string;
  }
) {
  return supabase.from("body_measurements").upsert(
    {
      user_id: userId,
      measured_at: values.measured_at,
      weight_kg: values.weight_kg ?? null,
      body_fat_percentage: values.body_fat_percentage ?? null,
      waist_cm: values.waist_cm ?? null,
      chest_cm: values.chest_cm ?? null,
      hips_cm: values.hips_cm ?? null,
      arm_cm: values.arm_cm ?? null,
      notes: values.notes || null,
    },
    { onConflict: "user_id,measured_at" }
  );
}

/** Zet alleen het gewicht van vandaag, met behoud van eventuele andere velden van diezelfde dag. */
export async function quickLogWeight(supabase: Client, userId: string, weightKg: number) {
  const todayKey = dateKey(new Date());
  return supabase.from("body_measurements").upsert(
    { user_id: userId, measured_at: todayKey, weight_kg: weightKg },
    { onConflict: "user_id,measured_at", ignoreDuplicates: false }
  );
}

export async function fetchProgressPhotos(supabase: Client) {
  const { data } = await supabase
    .from("progress_photos")
    .select("*")
    .order("taken_at", { ascending: false });
  return data ?? [];
}

const PHOTO_URL_EXPIRES_IN = 60 * 60; // 1 uur

export async function getProgressPhotoUrl(supabase: Client, photoPath: string) {
  const { data } = await supabase.storage
    .from("progress-photos")
    .createSignedUrl(photoPath, PHOTO_URL_EXPIRES_IN);
  return data?.signedUrl ?? null;
}

export async function getProgressPhotoUrls(supabase: Client, photoPaths: string[]) {
  if (photoPaths.length === 0) return new Map<string, string>();
  const { data } = await supabase.storage
    .from("progress-photos")
    .createSignedUrls(photoPaths, PHOTO_URL_EXPIRES_IN);

  const urls = new Map<string, string>();
  for (const entry of data ?? []) {
    if (entry.signedUrl && entry.path) urls.set(entry.path, entry.signedUrl);
  }
  return urls;
}
