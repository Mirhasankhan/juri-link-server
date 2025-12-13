import { z } from "zod";

export const LegalValidationSchema = z.object({
  serviceName: z.string().min(2, "Service name is required"),
  description: z.string().min(15, "Description is required"),
  importance: z.string().min(15, "Importance is required"),
});

export type LegalServiceInput = z.infer<typeof LegalValidationSchema>;
