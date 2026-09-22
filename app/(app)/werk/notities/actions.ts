"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { workNoteSchema } from "@/lib/validations/work";

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

function parseNoteForm(formData: FormData) {
  const tagsRaw = formData.get("tags");
  const tags = tagsRaw
    ? String(tagsRaw)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return workNoteSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content") || undefined,
    tags,
  });
}

export async function createNote(formData: FormData): Promise<ActionResult> {
  const parsed = parseNoteForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("work_notes").insert({
    user_id: user.id,
    title: parsed.data.title,
    content: parsed.data.content || null,
    tags: parsed.data.tags,
  });

  if (error) {
    return { success: false, error: "Aanmaken is niet gelukt." };
  }

  revalidatePath("/werk/notities");
  return { success: true, data: undefined };
}

export async function updateNote(
  noteId: string,
  formData: FormData
): Promise<ActionResult> {
  const parsed = parseNoteForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("work_notes")
    .update({
      title: parsed.data.title,
      content: parsed.data.content || null,
      tags: parsed.data.tags,
    })
    .eq("id", noteId);

  if (error) {
    return { success: false, error: "Opslaan is niet gelukt." };
  }

  revalidatePath("/werk/notities");
  return { success: true, data: undefined };
}

export async function deleteNote(noteId: string): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const { error } = await supabase.from("work_notes").delete().eq("id", noteId);

  if (error) {
    return { success: false, error: "Verwijderen is niet gelukt." };
  }

  revalidatePath("/werk/notities");
  return { success: true, data: undefined };
}

export async function convertNoteToTask(noteId: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const { data: note } = await supabase
    .from("work_notes")
    .select("title, content")
    .eq("id", noteId)
    .single();

  if (!note) {
    return { success: false, error: "Notitie niet gevonden." };
  }

  const { error } = await supabase.from("work_tasks").insert({
    user_id: user.id,
    title: note.title,
    notes: note.content,
    priority: "normaal",
  });

  if (error) {
    return { success: false, error: "Omzetten is niet gelukt." };
  }

  revalidatePath("/werk");
  revalidatePath("/werk/notities");
  return { success: true, data: undefined };
}

export async function convertNoteToLinkedinIdea(noteId: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const { data: note } = await supabase
    .from("work_notes")
    .select("title, content")
    .eq("id", noteId)
    .single();

  if (!note) {
    return { success: false, error: "Notitie niet gevonden." };
  }

  const { error } = await supabase.from("linkedin_ideas").insert({
    user_id: user.id,
    subject: note.title,
    body: note.content,
    status: "idee",
  });

  if (error) {
    return { success: false, error: "Omzetten is niet gelukt." };
  }

  revalidatePath("/werk/linkedin");
  revalidatePath("/werk/notities");
  return { success: true, data: undefined };
}
