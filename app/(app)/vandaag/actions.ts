"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { dailyTaskSchema } from "@/lib/validations/dailyTask";

type ActionResult = { success: true } | { success: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Niet ingelogd.");
  return { supabase, user };
}

export async function setTaskCompletion(
  taskId: string,
  dateKey: string,
  completed: boolean
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  if (completed) {
    const { error } = await supabase.from("daily_task_logs").insert({
      user_id: user.id,
      task_definition_id: taskId,
      completed_date: dateKey,
    });
    if (error && error.code !== "23505") {
      return { success: false, error: "Afvinken is niet gelukt." };
    }
  } else {
    const { error } = await supabase
      .from("daily_task_logs")
      .delete()
      .eq("task_definition_id", taskId)
      .eq("completed_date", dateKey);
    if (error) {
      return { success: false, error: "Uitvinken is niet gelukt." };
    }
  }

  revalidatePath("/vandaag");
  return { success: true };
}

function parseTaskForm(formData: FormData) {
  const specificDays = formData.getAll("specific_days").map(Number);
  const everyXDaysRaw = formData.get("every_x_days");
  const reminderTime = formData.get("reminder_time");

  return dailyTaskSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    frequency_type: formData.get("frequency_type"),
    specific_days: specificDays.length ? specificDays : undefined,
    every_x_days: everyXDaysRaw ? everyXDaysRaw : undefined,
    reminder_time: reminderTime ?? "",
  });
}

export async function createTask(formData: FormData): Promise<ActionResult> {
  const parsed = parseTaskForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { supabase, user } = await requireUser();

  const { count } = await supabase
    .from("daily_task_definitions")
    .select("id", { count: "exact", head: true });

  const { error } = await supabase.from("daily_task_definitions").insert({
    user_id: user.id,
    title: parsed.data.title,
    category: parsed.data.category,
    frequency_type: parsed.data.frequency_type,
    specific_days: parsed.data.specific_days ?? null,
    every_x_days: parsed.data.every_x_days ?? null,
    reminder_time: parsed.data.reminder_time || null,
    sort_order: count ?? 0,
  });

  if (error) {
    return { success: false, error: "Aanmaken is niet gelukt." };
  }

  revalidatePath("/vandaag");
  return { success: true };
}

export async function updateTask(
  taskId: string,
  formData: FormData
): Promise<ActionResult> {
  const parsed = parseTaskForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("daily_task_definitions")
    .update({
      title: parsed.data.title,
      category: parsed.data.category,
      frequency_type: parsed.data.frequency_type,
      specific_days: parsed.data.specific_days ?? null,
      every_x_days: parsed.data.every_x_days ?? null,
      reminder_time: parsed.data.reminder_time || null,
    })
    .eq("id", taskId);

  if (error) {
    return { success: false, error: "Opslaan is niet gelukt." };
  }

  revalidatePath("/vandaag");
  return { success: true };
}

export async function deleteTask(taskId: string): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("daily_task_definitions")
    .delete()
    .eq("id", taskId);

  if (error) {
    return { success: false, error: "Verwijderen is niet gelukt." };
  }

  revalidatePath("/vandaag");
  return { success: true };
}

export async function setCardOrder(
  cards: { card_key: string; sort_order: number }[]
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("dashboard_card_prefs").upsert(
    cards.map((card) => ({
      user_id: user.id,
      card_key: card.card_key,
      sort_order: card.sort_order,
    })),
    { onConflict: "user_id,card_key" }
  );

  if (error) {
    return { success: false, error: "Volgorde opslaan is niet gelukt." };
  }

  revalidatePath("/vandaag");
  return { success: true };
}

export async function setCardVisibility(
  cardKey: string,
  visible: boolean
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("dashboard_card_prefs")
    .update({ is_visible: visible })
    .eq("user_id", user.id)
    .eq("card_key", cardKey);

  if (error) {
    return { success: false, error: "Opslaan is niet gelukt." };
  }

  revalidatePath("/vandaag");
  return { success: true };
}
