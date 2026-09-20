"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { quickNoteSchema } from "@/lib/validations/note";

type ActionResult = { success: true } | { success: false; error: string };

export async function createInboxNote(formData: FormData): Promise<ActionResult> {
  const parsed = quickNoteSchema.safeParse({
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Je bent niet ingelogd." };
  }

  const { error } = await supabase.from("inbox_notes").insert({
    user_id: user.id,
    content: parsed.data.content,
  });

  if (error) {
    return { success: false, error: "Opslaan is niet gelukt. Probeer het opnieuw." };
  }

  revalidatePath("/vandaag");
  return { success: true };
}
