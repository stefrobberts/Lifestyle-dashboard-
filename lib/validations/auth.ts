import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Vul een geldig e-mailadres in."),
  password: z.string().min(6, "Wachtwoord moet minimaal 6 tekens zijn."),
});

export type LoginInput = z.infer<typeof loginSchema>;
