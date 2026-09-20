import { z } from "zod";

export const taskCategorySchema = z.enum(["supplement", "verzorging", "eigen"]);
export const taskFrequencySchema = z.enum([
  "daily",
  "specific_days",
  "every_x_days",
]);

export const dailyTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Vul een titel in.").max(80, "Maximaal 80 tekens."),
    category: taskCategorySchema,
    frequency_type: taskFrequencySchema,
    specific_days: z.array(z.number().int().min(1).max(7)).optional(),
    every_x_days: z.coerce.number().int().min(2, "Kies minimaal 2 dagen.").max(365).optional(),
    reminder_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Ongeldige tijd.")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.frequency_type === "specific_days" && !data.specific_days?.length) {
      ctx.addIssue({
        code: "custom",
        path: ["specific_days"],
        message: "Kies minstens één dag.",
      });
    }
    if (data.frequency_type === "every_x_days" && !data.every_x_days) {
      ctx.addIssue({
        code: "custom",
        path: ["every_x_days"],
        message: "Vul in om de hoeveel dagen.",
      });
    }
  });

export type DailyTaskInput = z.infer<typeof dailyTaskSchema>;
