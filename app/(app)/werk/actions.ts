"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { taskSchema, subtaskSchema } from "@/lib/validations/work";
import { nextRecurrenceDate, type RecurrenceType } from "@/lib/work";
import { dateKey } from "@/lib/date";
import { fetchSubtasks } from "@/lib/data/work";
import type { Subtask } from "@/components/werk/TaskFormSheet";

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

function parseTaskForm(formData: FormData) {
  return taskSchema.safeParse({
    title: formData.get("title"),
    notes: formData.get("notes") || undefined,
    deadline: formData.get("deadline") || "",
    priority: formData.get("priority"),
    category_id: formData.get("category_id") || "",
    recurrence_type: formData.get("recurrence_type") || "geen",
  });
}

export async function createTask(formData: FormData): Promise<ActionResult> {
  const parsed = parseTaskForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("work_tasks").insert({
    user_id: user.id,
    title: parsed.data.title,
    notes: parsed.data.notes || null,
    deadline: parsed.data.deadline || null,
    priority: parsed.data.priority,
    category_id: parsed.data.category_id || null,
    recurrence_type: parsed.data.recurrence_type,
  });

  if (error) {
    return { success: false, error: "Aanmaken is niet gelukt." };
  }

  revalidatePath("/werk");
  revalidatePath("/vandaag");
  return { success: true, data: undefined };
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
    .from("work_tasks")
    .update({
      title: parsed.data.title,
      notes: parsed.data.notes || null,
      deadline: parsed.data.deadline || null,
      priority: parsed.data.priority,
      category_id: parsed.data.category_id || null,
      recurrence_type: parsed.data.recurrence_type,
    })
    .eq("id", taskId);

  if (error) {
    return { success: false, error: "Opslaan is niet gelukt." };
  }

  revalidatePath("/werk");
  revalidatePath("/vandaag");
  return { success: true, data: undefined };
}

export async function toggleTaskComplete(
  taskId: string,
  completed: boolean
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const { data: task, error: fetchError } = await supabase
    .from("work_tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (fetchError || !task) {
    return { success: false, error: "Taak niet gevonden." };
  }

  const { error } = await supabase
    .from("work_tasks")
    .update({ completed_at: completed ? new Date().toISOString() : null })
    .eq("id", taskId);

  if (error) {
    return { success: false, error: "Bijwerken is niet gelukt." };
  }

  if (completed && task.recurrence_type !== "geen" && !task.parent_task_id) {
    const nextDeadline = nextRecurrenceDate(
      task.deadline,
      task.recurrence_type as RecurrenceType,
      new Date()
    );
    await supabase.from("work_tasks").insert({
      user_id: user.id,
      title: task.title,
      notes: task.notes,
      deadline: nextDeadline,
      priority: task.priority,
      category_id: task.category_id,
      recurrence_type: task.recurrence_type,
    });
  }

  revalidatePath("/werk");
  revalidatePath("/vandaag");
  return { success: true, data: undefined };
}

export async function postponeTask(taskId: string): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { error } = await supabase
    .from("work_tasks")
    .update({ deadline: dateKey(tomorrow) })
    .eq("id", taskId);

  if (error) {
    return { success: false, error: "Uitstellen is niet gelukt." };
  }

  revalidatePath("/werk");
  revalidatePath("/vandaag");
  return { success: true, data: undefined };
}

export async function deleteTask(taskId: string): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const { error } = await supabase.from("work_tasks").delete().eq("id", taskId);

  if (error) {
    return { success: false, error: "Verwijderen is niet gelukt." };
  }

  revalidatePath("/werk");
  revalidatePath("/vandaag");
  return { success: true, data: undefined };
}

export async function createSubtask(
  parentTaskId: string,
  formData: FormData
): Promise<ActionResult> {
  const parsed = subtaskSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("work_tasks").insert({
    user_id: user.id,
    parent_task_id: parentTaskId,
    title: parsed.data.title,
    priority: "normaal",
  });

  if (error) {
    return { success: false, error: "Aanmaken is niet gelukt." };
  }

  revalidatePath("/werk");
  return { success: true, data: undefined };
}

export async function toggleSubtaskComplete(
  subtaskId: string,
  completed: boolean
): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("work_tasks")
    .update({ completed_at: completed ? new Date().toISOString() : null })
    .eq("id", subtaskId);

  if (error) {
    return { success: false, error: "Bijwerken is niet gelukt." };
  }

  revalidatePath("/werk");
  return { success: true, data: undefined };
}

export async function deleteSubtask(subtaskId: string): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const { error } = await supabase.from("work_tasks").delete().eq("id", subtaskId);

  if (error) {
    return { success: false, error: "Verwijderen is niet gelukt." };
  }

  revalidatePath("/werk");
  return { success: true, data: undefined };
}

export async function getTaskSubtasks(taskId: string): Promise<Subtask[]> {
  const { supabase } = await requireUser();
  return fetchSubtasks(supabase, taskId);
}

const SEED_TASK_TITLES = ["Weekplanning maken", "Factuur versturen", "Portfolio bijwerken"];
const SEED_LINKEDIN_SUBJECT = "Hoe ik mijn workflow met AI heb versneld";
const SEED_NOTE_TITLE = "Ideeën voor volgend kwartaal";

/** Wist de voorbeeldtaken, het voorbeeld-LinkedIn-idee en de voorbeeldnotitie. */
export async function clearSampleWorkData(): Promise<ActionResult> {
  const { supabase } = await requireUser();

  await supabase.from("work_tasks").delete().in("title", SEED_TASK_TITLES);
  await supabase.from("linkedin_ideas").delete().eq("subject", SEED_LINKEDIN_SUBJECT);
  await supabase.from("work_notes").delete().eq("title", SEED_NOTE_TITLE);

  revalidatePath("/werk");
  revalidatePath("/werk/linkedin");
  revalidatePath("/werk/notities");
  return { success: true, data: undefined };
}
