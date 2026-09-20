import { z } from "zod";

export const magicLinkSchema = z.object({
  email: z.email("Vul een geldig e-mailadres in."),
});

export type MagicLinkInput = z.infer<typeof magicLinkSchema>;
