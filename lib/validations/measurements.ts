import { z } from "zod";

export const measurementSchema = z.object({
  measured_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ongeldige datum."),
  weight_kg: z.coerce.number().positive("Vul een geldig gewicht in.").optional(),
  body_fat_percentage: z.coerce
    .number()
    .positive("Vul een geldig percentage in.")
    .max(100, "Vetpercentage kan niet boven 100 zijn.")
    .optional(),
  waist_cm: z.coerce.number().positive("Vul een geldige omtrek in.").optional(),
  chest_cm: z.coerce.number().positive("Vul een geldige omtrek in.").optional(),
  hips_cm: z.coerce.number().positive("Vul een geldige omtrek in.").optional(),
  arm_cm: z.coerce.number().positive("Vul een geldige omtrek in.").optional(),
  notes: z.string().trim().max(500, "Dat is wel erg lang.").optional(),
});

export type MeasurementInput = z.infer<typeof measurementSchema>;

export const quickWeightSchema = z.object({
  weight_kg: z.coerce.number().positive("Vul een geldig gewicht in."),
});
