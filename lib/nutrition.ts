export type MacroTotals = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export type ProductMacros = {
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
};

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Macro's vermenigvuldigd met een factor (bv. aantal gelogde porties van een recept). */
export function scaleMacros(macros: MacroTotals, factor: number): MacroTotals {
  return {
    calories: Math.round(macros.calories * factor),
    protein_g: round1(macros.protein_g * factor),
    carbs_g: round1(macros.carbs_g * factor),
    fat_g: round1(macros.fat_g * factor),
  };
}

/** Macro's voor een gegeven hoeveelheid (in gram) van een product. */
export function calculateMacrosForQuantity(
  product: ProductMacros,
  grams: number
): MacroTotals {
  const factor = grams / 100;
  return {
    calories: Math.round(product.calories_per_100g * factor),
    protein_g: round1(product.protein_per_100g * factor),
    carbs_g: round1(product.carbs_per_100g * factor),
    fat_g: round1(product.fat_per_100g * factor),
  };
}

export type RecipeIngredientInput = {
  product: ProductMacros;
  quantity_g: number;
};

/** Totale macro's van een recept, en macro's per portie. */
export function calculateRecipeMacros(
  ingredients: RecipeIngredientInput[],
  servings: number
): { total: MacroTotals; perServing: MacroTotals } {
  const total = ingredients.reduce<MacroTotals>(
    (acc, { product, quantity_g }) => {
      const macros = calculateMacrosForQuantity(product, quantity_g);
      return {
        calories: acc.calories + macros.calories,
        protein_g: acc.protein_g + macros.protein_g,
        carbs_g: acc.carbs_g + macros.carbs_g,
        fat_g: acc.fat_g + macros.fat_g,
      };
    },
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  const safeServings = servings > 0 ? servings : 1;

  return {
    total: {
      calories: Math.round(total.calories),
      protein_g: round1(total.protein_g),
      carbs_g: round1(total.carbs_g),
      fat_g: round1(total.fat_g),
    },
    perServing: {
      calories: Math.round(total.calories / safeServings),
      protein_g: round1(total.protein_g / safeServings),
      carbs_g: round1(total.carbs_g / safeServings),
      fat_g: round1(total.fat_g / safeServings),
    },
  };
}

/** Som van de (al berekende, opgeslagen) macro's van een lijst dagboekregels. */
export function calculateDailyTotals(entries: MacroTotals[]): MacroTotals {
  return entries.reduce<MacroTotals>(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein_g: round1(acc.protein_g + entry.protein_g),
      carbs_g: round1(acc.carbs_g + entry.carbs_g),
      fat_g: round1(acc.fat_g + entry.fat_g),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );
}

/** Gemiddelde dagtotalen over meerdere dagen (voor het weekoverzicht). */
export function calculateWeeklyAverages(
  entriesByDate: Map<string, MacroTotals[]>
): MacroTotals & { dayCount: number } {
  const days = Array.from(entriesByDate.values());
  const dayCount = days.length;

  if (dayCount === 0) {
    return { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, dayCount: 0 };
  }

  const dailyTotals = days.map(calculateDailyTotals);
  const summed = calculateDailyTotals(dailyTotals);

  return {
    calories: Math.round(summed.calories / dayCount),
    protein_g: round1(summed.protein_g / dayCount),
    carbs_g: round1(summed.carbs_g / dayCount),
    fat_g: round1(summed.fat_g / dayCount),
    dayCount,
  };
}
