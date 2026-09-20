import { createClient } from "@/lib/supabase/server";
import { ensureDefaultRecipes, fetchDiaryForDate } from "@/lib/data/voeding";
import { dateKey } from "@/lib/date";
import { VoedingDiary } from "@/components/voeding/VoedingDiary";
import type { DiaryEntryView } from "@/components/voeding/DiaryMealSection";

export default async function VoedingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  await ensureDefaultRecipes(supabase, user.id);

  const todayKey = dateKey(new Date());
  const { entries, totals, calorieGoal, proteinGoal } = await fetchDiaryForDate(
    supabase,
    todayKey
  );

  const entriesByMeal: Record<string, DiaryEntryView[]> = {
    ontbijt: [],
    lunch: [],
    diner: [],
    snack: [],
  };

  for (const entry of entries) {
    const title =
      entry.source_type === "recipe"
        ? (entry.recipes?.title ?? "Recept")
        : (entry.products?.name ?? "Product");
    const detail =
      entry.source_type === "recipe"
        ? `${entry.servings} ${Number(entry.servings) === 1 ? "portie" : "porties"}`
        : `${entry.quantity_g} g`;

    entriesByMeal[entry.meal_type]?.push({
      id: entry.id,
      title,
      calories: entry.calories,
      protein_g: entry.protein_g,
      carbs_g: entry.carbs_g,
      fat_g: entry.fat_g,
      detail,
    });
  }

  return (
    <VoedingDiary
      entryDate={todayKey}
      entriesByMeal={entriesByMeal}
      totals={totals}
      calorieGoal={calorieGoal}
      proteinGoal={proteinGoal}
    />
  );
}
