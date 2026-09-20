"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { magicLinkSchema } from "@/lib/validations/auth";

type RequestMagicLinkResult =
  | { success: true }
  | { success: false; error: string };

export async function requestMagicLink(
  formData: FormData
): Promise<RequestMagicLinkResult> {
  const parsed = magicLinkSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const headerList = await headers();
  const origin = headerList.get("origin");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    return {
      success: false,
      error: "Het versturen van de inloglink is niet gelukt. Probeer het opnieuw.",
    };
  }

  return { success: true };
}
