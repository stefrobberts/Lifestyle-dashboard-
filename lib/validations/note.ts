import { z } from "zod";

export const quickNoteSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Vul een tekst in.")
    .max(2000, "Dat is wel erg lang, maak het iets korter."),
});

export type QuickNoteInput = z.infer<typeof quickNoteSchema>;
