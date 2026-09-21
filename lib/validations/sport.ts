import { z } from "zod";

export const muscleGroupSchema = z.enum([
  "borst",
  "rug",
  "benen",
  "schouders",
  "armen",
  "buik",
]);

export type MuscleGroup = z.infer<typeof muscleGroupSchema>;

export const exerciseSchema = z.object({
  name: z.string().trim().min(1, "Vul een naam in.").max(80, "Maximaal 80 tekens."),
  muscle_group: muscleGroupSchema,
});

export type ExerciseInput = z.infer<typeof exerciseSchema>;

export const scheduleExerciseSchema = z.object({
  exercise_id: z.uuid(),
  target_sets: z.coerce.number().int().min(1, "Minimaal 1 set.").max(20, "Maximaal 20 sets."),
  target_reps: z.string().trim().min(1, "Vul herhalingen in.").max(20, "Maximaal 20 tekens."),
});

export const scheduleSchema = z.object({
  title: z.string().trim().min(1, "Vul een titel in.").max(80, "Maximaal 80 tekens."),
  exercises: z
    .array(scheduleExerciseSchema)
    .min(1, "Voeg minstens één oefening toe."),
});

export type ScheduleInput = z.infer<typeof scheduleSchema>;

export const logSetSchema = z.object({
  exercise_id: z.uuid(),
  set_number: z.coerce.number().int().min(1),
  weight_kg: z.coerce.number().min(0, "Kan niet negatief zijn.").max(1000, "Dat lijkt niet te kloppen."),
  reps: z.coerce.number().int().min(1, "Minimaal 1 herhaling.").max(200, "Dat lijkt niet te kloppen."),
});

export type LogSetInput = z.infer<typeof logSetSchema>;
