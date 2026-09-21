"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchTodaysSchedule } from "@/lib/data/sport";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Niet ingelogd.");
  return { supabase, user };
}

/** Voor de snelle actieknop: start direct de workout van vandaag. */
export async function startTodaysWorkout() {
  const { supabase } = await requireUser();

  const schedule = await fetchTodaysSchedule(supabase);
  if (!schedule) {
    redirect("/sport");
  }

  await startWorkout(schedule.id, schedule.title);
}

export async function startWorkout(scheduleId: string, title: string) {
  const { supabase, user } = await requireUser();

  const { data: session, error } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: user.id,
      schedule_id: scheduleId,
      title,
    })
    .select("id")
    .single();

  if (error || !session) {
    throw new Error("Workout starten is niet gelukt.");
  }

  redirect(`/sport/workout/${session.id}`);
}
