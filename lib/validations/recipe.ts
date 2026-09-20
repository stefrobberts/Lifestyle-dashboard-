import { z } from "zod";

export const recipeTagSchema = z.enum([
  "ontbijt",
  "lunch",
  "diner",
  "snack",
  "eiwitrijk",
]);

export const recipeIngredientSchema = z.object({
  product_id: z.uuid(),
  quantity_g: z.coerce.number().positive("Vul een hoeveelheid groter dan 0 in."),
});

export const recipeSchema = z.object({
  title: z.string().trim().min(1, "Vul een titel in.").max(120, "Maximaal 120 tekens."),
  instructions: z.string().trim().max(4000, "Dat is wel erg lang.").optional(),
  servings: z.coerce.number().int().min(1, "Minimaal 1 portie.").max(50, "Maximaal 50 porties."),
  tags: z.array(recipeTagSchema).default([]),
  ingredients: z
    .array(recipeIngredientSchema)
    .min(1, "Voeg minstens één ingrediënt toe."),
});

export type RecipeInput = z.infer<typeof recipeSchema>;

export const customProductSchema = z.object({
  name: z.string().trim().min(1, "Vul een naam in.").max(120, "Maximaal 120 tekens."),
  brand: z.string().trim().max(120).optional(),
  calories_per_100g: z.coerce.number().min(0, "Kan niet negatief zijn."),
  protein_per_100g: z.coerce.number().min(0, "Kan niet negatief zijn."),
  carbs_per_100g: z.coerce.number().min(0, "Kan niet negatief zijn."),
  fat_per_100g: z.coerce.number().min(0, "Kan niet negatief zijn."),
  default_portion_g: z.coerce.number().positive().optional(),
});

export type CustomProductInput = z.infer<typeof customProductSchema>;
