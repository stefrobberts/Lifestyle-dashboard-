"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { linkedinIdeaSchema, linkedinIdeaStatusSchema } from "@/lib/validations/work";

type ActionResult = { success: true } | { success: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Niet ingelogd.");
  return { supabase, user };
}

function parseIdeaForm(formData: FormData) {
  const tagsRaw = formData.get("tags");
  const tags = tagsRaw
    ? String(tagsRaw)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return linkedinIdeaSchema.safeParse({
    subject: formData.get("subject"),
    hook: formData.get("hook") || undefined,
    body: formData.get("body") || undefined,
    tags,
    status: formData.get("status") || "idee",
    planned_date: formData.get("planned_date") || "",
  });
}

async function uploadImageIfPresent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  ideaId: string,
  formData: FormData
): Promise<string | undefined> {
  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) return undefined;

  const extension = image.name.split(".").pop() || "jpg";
  const path = `${userId}/${ideaId}.${extension}`;

  const { error } = await supabase.storage
    .from("linkedin-images")
    .upload(path, image, { upsert: true, contentType: image.type });

  if (error) return undefined;
  return path;
}

/** Voor de snelle actieknop: alleen een onderwerp, geen navigatie. */
export async function quickCreateLinkedinIdea(formData: FormData): Promise<ActionResult> {
  const subject = String(formData.get("subject") ?? "").trim();
  if (!subject) {
    return { success: false, error: "Vul een onderwerp in." };
  }

  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("linkedin_ideas").insert({
    user_id: user.id,
    subject,
    status: "idee",
  });

  if (error) {
    return { success: false, error: "Aanmaken is niet gelukt." };
  }

  revalidatePath("/werk/linkedin");
  return { success: true };
}

export async function createLinkedinIdea(formData: FormData): Promise<ActionResult> {
  const parsed = parseIdeaForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { supabase, user } = await requireUser();

  const { data: idea, error } = await supabase
    .from("linkedin_ideas")
    .insert({
      user_id: user.id,
      subject: parsed.data.subject,
      hook: parsed.data.hook || null,
      body: parsed.data.body || null,
      tags: parsed.data.tags,
      status: parsed.data.status,
      planned_date: parsed.data.planned_date || null,
    })
    .select("id")
    .single();

  if (error || !idea) {
    return { success: false, error: "Aanmaken is niet gelukt." };
  }

  const imagePath = await uploadImageIfPresent(supabase, user.id, idea.id, formData);
  if (imagePath) {
    await supabase.from("linkedin_ideas").update({ image_path: imagePath }).eq("id", idea.id);
  }

  revalidatePath("/werk/linkedin");
  redirect(`/werk/linkedin/${idea.id}`);
}

export async function updateLinkedinIdea(
  ideaId: string,
  formData: FormData
): Promise<ActionResult> {
  const parsed = parseIdeaForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("linkedin_ideas")
    .update({
      subject: parsed.data.subject,
      hook: parsed.data.hook || null,
      body: parsed.data.body || null,
      tags: parsed.data.tags,
      status: parsed.data.status,
      planned_date: parsed.data.planned_date || null,
    })
    .eq("id", ideaId);

  if (error) {
    return { success: false, error: "Opslaan is niet gelukt." };
  }

  const imagePath = await uploadImageIfPresent(supabase, user.id, ideaId, formData);
  if (imagePath) {
    await supabase.from("linkedin_ideas").update({ image_path: imagePath }).eq("id", ideaId);
  }

  revalidatePath("/werk/linkedin");
  revalidatePath(`/werk/linkedin/${ideaId}`);
  return { success: true };
}

export async function setLinkedinIdeaStatus(
  ideaId: string,
  status: string
): Promise<ActionResult> {
  const parsedStatus = linkedinIdeaStatusSchema.safeParse(status);
  if (!parsedStatus.success) {
    return { success: false, error: "Ongeldige status." };
  }

  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("linkedin_ideas")
    .update({ status: parsedStatus.data })
    .eq("id", ideaId);

  if (error) {
    return { success: false, error: "Bijwerken is niet gelukt." };
  }

  revalidatePath("/werk/linkedin");
  revalidatePath(`/werk/linkedin/${ideaId}`);
  return { success: true };
}

export async function deleteLinkedinIdea(ideaId: string): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const { error } = await supabase.from("linkedin_ideas").delete().eq("id", ideaId);

  if (error) {
    return { success: false, error: "Verwijderen is niet gelukt." };
  }

  revalidatePath("/werk/linkedin");
  return { success: true };
}
