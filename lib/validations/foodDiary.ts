import { z } from "zod";

export const mealTypeSchema = z.enum(["ontbijt", "lunch", "diner", "snack"]);

export const logProductSchema = z.object({
  product_id: z.uuid(),
  meal_type: mealTypeSchema,
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ongeldige datum."),
  quantity_g: z.coerce.number().positive("Vul een hoeveelheid groter dan 0 in."),
});

export const logRecipeSchema = z.object({
  recipe_id: z.uuid(),
  meal_type: mealTypeSchema,
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ongeldige datum."),
  servings: z.coerce.number().positive("Vul een aantal porties groter dan 0 in."),
});

export type LogProductInput = z.infer<typeof logProductSchema>;
export type LogRecipeInput = z.infer<typeof logRecipeSchema>;
