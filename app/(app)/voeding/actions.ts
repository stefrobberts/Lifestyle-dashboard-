"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logProductSchema, logRecipeSchema } from "@/lib/validations/foodDiary";
import {
  calculateMacrosForQuantity,
  calculateRecipeMacros,
  scaleMacros,
} from "@/lib/nutrition";
import { dateKey } from "@/lib/date";

type ActionResult = { success: true } | { success: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Niet ingelogd.");
  return { supabase, user };
}

export async function logProduct(formData: FormData): Promise<ActionResult> {
  const parsed = logProductSchema.safeParse({
    product_id: formData.get("product_id"),
    meal_type: formData.get("meal_type"),
    entry_date: formData.get("entry_date"),
    quantity_g: formData.get("quantity_g"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { supabase, user } = await requireUser();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g")
    .eq("id", parsed.data.product_id)
    .single();

  if (productError || !product) {
    return { success: false, error: "Product niet gevonden." };
  }

  const macros = calculateMacrosForQuantity(product, parsed.data.quantity_g);

  const { error } = await supabase.from("food_diary_entries").insert({
    user_id: user.id,
    entry_date: parsed.data.entry_date,
    meal_type: parsed.data.meal_type,
    source_type: "product",
    product_id: parsed.data.product_id,
    quantity_g: parsed.data.quantity_g,
    calories: macros.calories,
    protein_g: macros.protein_g,
    carbs_g: macros.carbs_g,
    fat_g: macros.fat_g,
  });

  if (error) {
    return { success: false, error: "Loggen is niet gelukt." };
  }

  revalidatePath("/voeding");
  revalidatePath("/vandaag");
  return { success: true };
}

export async function logRecipe(formData: FormData): Promise<ActionResult> {
  const parsed = logRecipeSchema.safeParse({
    recipe_id: formData.get("recipe_id"),
    meal_type: formData.get("meal_type"),
    entry_date: formData.get("entry_date"),
    servings: formData.get("servings"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { supabase, user } = await requireUser();

  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("servings, recipe_ingredients(quantity_g, products(*))")
    .eq("id", parsed.data.recipe_id)
    .single();

  if (recipeError || !recipe) {
    return { success: false, error: "Recept niet gevonden." };
  }

  const { perServing } = calculateRecipeMacros(
    recipe.recipe_ingredients.map((ri) => ({
      product: ri.products!,
      quantity_g: ri.quantity_g,
    })),
    recipe.servings
  );

  const macros = scaleMacros(perServing, parsed.data.servings);

  const { error } = await supabase.from("food_diary_entries").insert({
    user_id: user.id,
    entry_date: parsed.data.entry_date,
    meal_type: parsed.data.meal_type,
    source_type: "recipe",
    recipe_id: parsed.data.recipe_id,
    servings: parsed.data.servings,
    calories: macros.calories,
    protein_g: macros.protein_g,
    carbs_g: macros.carbs_g,
    fat_g: macros.fat_g,
  });

  if (error) {
    return { success: false, error: "Loggen is niet gelukt." };
  }

  revalidatePath("/voeding");
  revalidatePath("/vandaag");
  return { success: true };
}

export async function deleteEntry(entryId: string): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("food_diary_entries")
    .delete()
    .eq("id", entryId);

  if (error) {
    return { success: false, error: "Verwijderen is niet gelukt." };
  }

  revalidatePath("/voeding");
  revalidatePath("/vandaag");
  return { success: true };
}

export async function copyFromYesterday(
  todayKeyValue: string
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const today = new Date(`${todayKeyValue}T00:00:00`);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = dateKey(yesterday);

  const { data: entries, error: fetchError } = await supabase
    .from("food_diary_entries")
    .select("*")
    .eq("entry_date", yesterdayKey);

  if (fetchError) {
    return { success: false, error: "Ophalen van gisteren is niet gelukt." };
  }

  if (!entries || entries.length === 0) {
    return { success: false, error: "Gisteren staat niets gelogd." };
  }

  const { error } = await supabase.from("food_diary_entries").insert(
    entries.map((entry) => ({
      user_id: user.id,
      entry_date: todayKeyValue,
      meal_type: entry.meal_type,
      source_type: entry.source_type,
      product_id: entry.product_id,
      recipe_id: entry.recipe_id,
      quantity_g: entry.quantity_g,
      servings: entry.servings,
      calories: entry.calories,
      protein_g: entry.protein_g,
      carbs_g: entry.carbs_g,
      fat_g: entry.fat_g,
    }))
  );

  if (error) {
    return { success: false, error: "Kopiëren is niet gelukt." };
  }

  revalidatePath("/voeding");
  revalidatePath("/vandaag");
  return { success: true };
}
