"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true } | { success: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Niet ingelogd.");
  return { supabase, user };
}

async function markProcessed(
  supabase: Awaited<ReturnType<typeof createClient>>,
  inboxNoteId: string
) {
  await supabase
    .from("inbox_notes")
    .update({ is_processed: true })
    .eq("id", inboxNoteId);
}

export async function processInboxNoteToTask(inboxNoteId: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const { data: inboxNote } = await supabase
    .from("inbox_notes")
    .select("content")
    .eq("id", inboxNoteId)
    .single();

  if (!inboxNote) {
    return { success: false, error: "Notitie niet gevonden." };
  }

  const { error } = await supabase.from("work_tasks").insert({
    user_id: user.id,
    title: inboxNote.content.slice(0, 150),
    priority: "normaal",
  });

  if (error) {
    return { success: false, error: "Omzetten is niet gelukt." };
  }

  await markProcessed(supabase, inboxNoteId);

  revalidatePath("/werk");
  revalidatePath("/werk/inbox");
  return { success: true };
}

export async function processInboxNoteToNote(inboxNoteId: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const { data: inboxNote } = await supabase
    .from("inbox_notes")
    .select("content")
    .eq("id", inboxNoteId)
    .single();

  if (!inboxNote) {
    return { success: false, error: "Notitie niet gevonden." };
  }

  const { error } = await supabase.from("work_notes").insert({
    user_id: user.id,
    title: inboxNote.content.slice(0, 150),
    content: inboxNote.content,
  });

  if (error) {
    return { success: false, error: "Omzetten is niet gelukt." };
  }

  await markProcessed(supabase, inboxNoteId);

  revalidatePath("/werk/notities");
  revalidatePath("/werk/inbox");
  return { success: true };
}

export async function processInboxNoteToLinkedinIdea(
  inboxNoteId: string
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const { data: inboxNote } = await supabase
    .from("inbox_notes")
    .select("content")
    .eq("id", inboxNoteId)
    .single();

  if (!inboxNote) {
    return { success: false, error: "Notitie niet gevonden." };
  }

  const { error } = await supabase.from("linkedin_ideas").insert({
    user_id: user.id,
    subject: inboxNote.content.slice(0, 150),
    body: inboxNote.content,
    status: "idee",
  });

  if (error) {
    return { success: false, error: "Omzetten is niet gelukt." };
  }

  await markProcessed(supabase, inboxNoteId);

  revalidatePath("/werk/linkedin");
  revalidatePath("/werk/inbox");
  return { success: true };
}

export async function dismissInboxNote(inboxNoteId: string): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const { error } = await supabase.from("inbox_notes").delete().eq("id", inboxNoteId);

  if (error) {
    return { success: false, error: "Verwijderen is niet gelukt." };
  }

  revalidatePath("/werk/inbox");
  return { success: true };
}
