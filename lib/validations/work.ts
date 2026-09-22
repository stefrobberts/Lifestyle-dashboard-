import { z } from "zod";

export const taskPrioritySchema = z.enum(["hoog", "normaal", "laag"]);
export const recurrenceTypeSchema = z.enum(["geen", "dagelijks", "wekelijks", "maandelijks"]);

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Vul een titel in.").max(150, "Maximaal 150 tekens."),
  notes: z.string().trim().max(2000, "Dat is wel erg lang.").optional(),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ongeldige datum.")
    .optional()
    .or(z.literal("")),
  priority: taskPrioritySchema,
  category_id: z.uuid().optional().or(z.literal("")),
  recurrence_type: recurrenceTypeSchema,
});

export type TaskInput = z.infer<typeof taskSchema>;

export const subtaskSchema = z.object({
  title: z.string().trim().min(1, "Vul een titel in.").max(150, "Maximaal 150 tekens."),
});

export const linkedinIdeaStatusSchema = z.enum(["idee", "concept", "gepland", "gepubliceerd"]);

export const linkedinIdeaSchema = z.object({
  subject: z.string().trim().min(1, "Vul een onderwerp in.").max(150, "Maximaal 150 tekens."),
  hook: z.string().trim().max(500, "Dat is wel erg lang.").optional(),
  body: z.string().trim().max(5000, "Dat is wel erg lang.").optional(),
  tags: z.array(z.string().trim().min(1).max(30)).default([]),
  status: linkedinIdeaStatusSchema,
  planned_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ongeldige datum.")
    .optional()
    .or(z.literal("")),
});

export type LinkedinIdeaInput = z.infer<typeof linkedinIdeaSchema>;

export const workNoteSchema = z.object({
  title: z.string().trim().min(1, "Vul een titel in.").max(150, "Maximaal 150 tekens."),
  content: z.string().trim().max(5000, "Dat is wel erg lang.").optional(),
  tags: z.array(z.string().trim().min(1).max(30)).default([]),
});

export type WorkNoteInput = z.infer<typeof workNoteSchema>;

export const workCategorySchema = z.object({
  name: z.string().trim().min(1, "Vul een naam in.").max(60, "Maximaal 60 tekens."),
});
