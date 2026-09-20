import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { calculateRecipeMacros } from "@/lib/nutrition";

type Client = SupabaseClient<Database>;

const PHOTO_URL_EXPIRES_IN = 60 * 60; // 1 uur

export async function getRecipePhotoUrl(
  supabase: Client,
  photoPath: string | null
): Promise<string | null> {
  if (!photoPath) return null;
  const { data } = await supabase.storage
    .from("recipe-photos")
    .createSignedUrl(photoPath, PHOTO_URL_EXPIRES_IN);
  return data?.signedUrl ?? null;
}

export async function fetchRecipes(supabase: Client) {
  const { data: recipes } = await supabase
    .from("recipes")
    .select("*, recipe_ingredients(quantity_g, products(*))")
    .order("created_at", { ascending: false });

  return Promise.all(
    (recipes ?? []).map(async (recipe) => {
      const { perServing } = calculateRecipeMacros(
        recipe.recipe_ingredients.map((ri) => ({
          product: ri.products!,
          quantity_g: ri.quantity_g,
        })),
        recipe.servings
      );
      const photoUrl = await getRecipePhotoUrl(supabase, recipe.photo_path);
      return { ...recipe, perServing, photoUrl };
    })
  );
}

export async function fetchRecipeDetail(supabase: Client, recipeId: string) {
  const { data: recipe } = await supabase
    .from("recipes")
    .select("*, recipe_ingredients(*, products(*))")
    .eq("id", recipeId)
    .maybeSingle();

  if (!recipe) return null;

  const ingredients = recipe.recipe_ingredients.sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const { total, perServing } = calculateRecipeMacros(
    ingredients.map((ri) => ({ product: ri.products!, quantity_g: ri.quantity_g })),
    recipe.servings
  );

  const photoUrl = await getRecipePhotoUrl(supabase, recipe.photo_path);

  return { ...recipe, recipe_ingredients: ingredients, total, perServing, photoUrl };
}
