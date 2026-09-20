import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { calculateDailyTotals } from "@/lib/nutrition";

type Client = SupabaseClient<Database>;

export async function fetchDiaryForDate(supabase: Client, entryDate: string) {
  const [{ data: entries }, { data: settings }] = await Promise.all([
    supabase
      .from("food_diary_entries")
      .select("*, products(name), recipes(title)")
      .eq("entry_date", entryDate)
      .order("logged_at", { ascending: true }),
    supabase.from("user_settings").select("*").maybeSingle(),
  ]);

  const list = entries ?? [];
  const totals = calculateDailyTotals(list);

  return {
    entries: list,
    totals,
    calorieGoal: settings?.calorie_goal ?? 2400,
    proteinGoal: settings?.protein_goal_g ?? 180,
  };
}

type SeedProductKey =
  | "havermout"
  | "halfvolle_melk"
  | "banaan"
  | "amandelen"
  | "kipfilet"
  | "zilvervliesrijst"
  | "broccoli"
  | "griekse_yoghurt"
  | "granola"
  | "honing";

const SEED_PRODUCTS: Record<
  SeedProductKey,
  { name: string; calories: number; protein: number; carbs: number; fat: number }
> = {
  havermout: { name: "Havermout", calories: 375, protein: 13, carbs: 58, fat: 7 },
  halfvolle_melk: { name: "Halfvolle melk", calories: 46, protein: 3.4, carbs: 4.7, fat: 1.5 },
  banaan: { name: "Banaan", calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  amandelen: { name: "Amandelen", calories: 579, protein: 21, carbs: 22, fat: 50 },
  kipfilet: { name: "Kipfilet (gegrild)", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  zilvervliesrijst: {
    name: "Zilvervliesrijst (gekookt)",
    calories: 123,
    protein: 2.6,
    carbs: 26,
    fat: 1,
  },
  broccoli: { name: "Broccoli (gekookt)", calories: 35, protein: 2.4, carbs: 7, fat: 0.4 },
  griekse_yoghurt: {
    name: "Griekse yoghurt 0%",
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
  },
  granola: { name: "Granola", calories: 450, protein: 10, carbs: 60, fat: 18 },
  honing: { name: "Honing", calories: 304, protein: 0.3, carbs: 82, fat: 0 },
};

/**
 * Vult de app bij de eerste keer met een paar realistische voorbeeldrecepten.
 * Race-veilig via een conditionele update: alleen de aanroep die de vlag
 * daadwerkelijk van false naar true zet (en dus een rij terugkrijgt) mag
 * seeden. Bij gelijktijdige requests verliest de rest de "claim" en doet niets.
 */
export async function ensureDefaultRecipes(supabase: Client, userId: string) {
  const { data: claimed } = await supabase
    .from("user_settings")
    .update({ sample_recipes_seeded: true })
    .eq("user_id", userId)
    .eq("sample_recipes_seeded", false)
    .select("id");

  if (!claimed || claimed.length === 0) return;

  const { data: insertedProducts, error: productsError } = await supabase
    .from("products")
    .insert(
      (Object.keys(SEED_PRODUCTS) as SeedProductKey[]).map((key) => {
        const p = SEED_PRODUCTS[key];
        return {
          user_id: userId,
          source: "custom" as const,
          name: p.name,
          calories_per_100g: p.calories,
          protein_per_100g: p.protein,
          carbs_per_100g: p.carbs,
          fat_per_100g: p.fat,
        };
      })
    )
    .select("id, name");

  if (productsError || !insertedProducts) return;

  const productId = (name: string) =>
    insertedProducts.find((p) => p.name === SEED_PRODUCTS[name as SeedProductKey].name)!.id;

  const recipesToSeed = [
    {
      title: "Havermout met fruit en noten",
      servings: 1,
      tags: ["ontbijt"],
      instructions:
        "Breng de melk in een steelpan aan de kook. Voeg de havermout toe en laat op laag vuur ongeveer 5 minuten sudderen, af en toe roeren tot een romige pap ontstaat. Schep de havermout in een kom. Snijd de banaan in plakjes en verdeel die met de amandelen over de pap.",
      ingredients: [
        { key: "havermout" as const, grams: 50 },
        { key: "halfvolle_melk" as const, grams: 200 },
        { key: "banaan" as const, grams: 100 },
        { key: "amandelen" as const, grams: 15 },
      ],
    },
    {
      title: "Kipfilet met rijst en broccoli",
      servings: 1,
      tags: ["diner", "eiwitrijk"],
      instructions:
        "Kook de zilvervliesrijst volgens de aanwijzingen op de verpakking. Snijd de broccoli in roosjes en stoom of kook ze in ongeveer 5 minuten beetgaar. Bestrooi de kipfilet met peper en zout en bak 'm in een klein scheutje olie op middelhoog vuur 6 tot 8 minuten per kant gaar. Serveer de kipfilet met de rijst en broccoli.",
      ingredients: [
        { key: "kipfilet" as const, grams: 150 },
        { key: "zilvervliesrijst" as const, grams: 150 },
        { key: "broccoli" as const, grams: 150 },
      ],
    },
    {
      title: "Griekse yoghurt met granola",
      servings: 1,
      tags: ["ontbijt", "snack", "eiwitrijk"],
      instructions:
        "Schep de Griekse yoghurt in een kom. Verdeel de granola erover en besprenkel alles met de honing. Direct serveren.",
      ingredients: [
        { key: "griekse_yoghurt" as const, grams: 200 },
        { key: "granola" as const, grams: 40 },
        { key: "honing" as const, grams: 15 },
      ],
    },
  ];

  for (const recipe of recipesToSeed) {
    const { data: inserted } = await supabase
      .from("recipes")
      .insert({
        user_id: userId,
        title: recipe.title,
        servings: recipe.servings,
        tags: recipe.tags,
        instructions: recipe.instructions,
      })
      .select("id")
      .single();

    if (!inserted) continue;

    await supabase.from("recipe_ingredients").insert(
      recipe.ingredients.map((ingredient, index) => ({
        user_id: userId,
        recipe_id: inserted.id,
        product_id: productId(ingredient.key),
        quantity_g: ingredient.grams,
        sort_order: index,
      }))
    );
  }
}

export async function fetchWeekTotals(
  supabase: Client,
  weekDateKeys: string[]
) {
  const { data: entries } = await supabase
    .from("food_diary_entries")
    .select("entry_date, calories, protein_g, carbs_g, fat_g")
    .in("entry_date", weekDateKeys);

  const byDate = new Map<string, typeof entries>();
  for (const key of weekDateKeys) byDate.set(key, []);
  for (const entry of entries ?? []) {
    const list = byDate.get(entry.entry_date) ?? [];
    list.push(entry);
    byDate.set(entry.entry_date, list);
  }

  return byDate as Map<
    string,
    { calories: number; protein_g: number; carbs_g: number; fat_g: number }[]
  >;
}
