"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { recipeSchema } from "@/lib/validations/recipe";

type ActionResult = { success: true } | { success: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Niet ingelogd.");
  return { supabase, user };
}

export type RecipeSearchResult = {
  id: string;
  title: string;
  tags: string[];
  is_favorite: boolean;
};

export async function searchRecipes(query: string): Promise<RecipeSearchResult[]> {
  const { supabase } = await requireUser();
  const trimmed = query.trim();

  let request = supabase
    .from("recipes")
    .select("id, title, tags, is_favorite")
    .order("is_favorite", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(15);

  if (trimmed.length >= 1) {
    request = request.ilike("title", `%${trimmed}%`);
  }

  const { data } = await request;
  return data ?? [];
}

const SEED_RECIPE_TITLES = [
  "Havermout met fruit en noten",
  "Kipfilet met rijst en broccoli",
  "Griekse yoghurt met granola",
];

export async function clearSampleRecipes(): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("recipes")
    .delete()
    .in("title", SEED_RECIPE_TITLES);

  if (error) {
    return { success: false, error: "Wissen is niet gelukt." };
  }

  revalidatePath("/voeding/recepten");
  return { success: true };
}

function parseRecipeForm(formData: FormData) {
  const tagsRaw = formData.getAll("tags");
  const ingredientsRaw = formData.get("ingredients_json");

  let ingredients: unknown = [];
  try {
    ingredients = ingredientsRaw ? JSON.parse(String(ingredientsRaw)) : [];
  } catch {
    ingredients = [];
  }

  return recipeSchema.safeParse({
    title: formData.get("title"),
    instructions: formData.get("instructions") || undefined,
    servings: formData.get("servings"),
    tags: tagsRaw,
    ingredients,
  });
}

async function uploadPhotoIfPresent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  recipeId: string,
  formData: FormData
): Promise<string | null | undefined> {
  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) return undefined;

  const extension = photo.name.split(".").pop() || "jpg";
  const path = `${userId}/${recipeId}.${extension}`;

  const { error } = await supabase.storage
    .from("recipe-photos")
    .upload(path, photo, { upsert: true, contentType: photo.type });

  if (error) return undefined;
  return path;
}

export async function createRecipe(formData: FormData): Promise<ActionResult> {
  const parsed = parseRecipeForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { supabase, user } = await requireUser();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      instructions: parsed.data.instructions ?? null,
      servings: parsed.data.servings,
      tags: parsed.data.tags,
    })
    .select("id")
    .single();

  if (error || !recipe) {
    return { success: false, error: "Aanmaken is niet gelukt." };
  }

  const { error: ingredientsError } = await supabase
    .from("recipe_ingredients")
    .insert(
      parsed.data.ingredients.map((ingredient, index) => ({
        user_id: user.id,
        recipe_id: recipe.id,
        product_id: ingredient.product_id,
        quantity_g: ingredient.quantity_g,
        sort_order: index,
      }))
    );

  if (ingredientsError) {
    return { success: false, error: "Ingrediënten opslaan is niet gelukt." };
  }

  const photoPath = await uploadPhotoIfPresent(supabase, user.id, recipe.id, formData);
  if (photoPath) {
    await supabase.from("recipes").update({ photo_path: photoPath }).eq("id", recipe.id);
  }

  revalidatePath("/voeding/recepten");
  redirect(`/voeding/recepten/${recipe.id}`);
}

export async function updateRecipe(
  recipeId: string,
  formData: FormData
): Promise<ActionResult> {
  const parsed = parseRecipeForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("recipes")
    .update({
      title: parsed.data.title,
      instructions: parsed.data.instructions ?? null,
      servings: parsed.data.servings,
      tags: parsed.data.tags,
    })
    .eq("id", recipeId);

  if (error) {
    return { success: false, error: "Opslaan is niet gelukt." };
  }

  await supabase.from("recipe_ingredients").delete().eq("recipe_id", recipeId);
  const { error: ingredientsError } = await supabase
    .from("recipe_ingredients")
    .insert(
      parsed.data.ingredients.map((ingredient, index) => ({
        user_id: user.id,
        recipe_id: recipeId,
        product_id: ingredient.product_id,
        quantity_g: ingredient.quantity_g,
        sort_order: index,
      }))
    );

  if (ingredientsError) {
    return { success: false, error: "Ingrediënten opslaan is niet gelukt." };
  }

  const photoPath = await uploadPhotoIfPresent(supabase, user.id, recipeId, formData);
  if (photoPath) {
    await supabase.from("recipes").update({ photo_path: photoPath }).eq("id", recipeId);
  }

  revalidatePath("/voeding/recepten");
  revalidatePath(`/voeding/recepten/${recipeId}`);
  redirect(`/voeding/recepten/${recipeId}`);
}

export async function deleteRecipe(recipeId: string): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const { error } = await supabase.from("recipes").delete().eq("id", recipeId);

  if (error) {
    return { success: false, error: "Verwijderen is niet gelukt." };
  }

  revalidatePath("/voeding/recepten");
  return { success: true };
}

export async function toggleRecipeFavorite(
  recipeId: string,
  favorite: boolean
): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("recipes")
    .update({ is_favorite: favorite })
    .eq("id", recipeId);

  if (error) {
    return { success: false, error: "Opslaan is niet gelukt." };
  }

  revalidatePath("/voeding/recepten");
  return { success: true };
}
