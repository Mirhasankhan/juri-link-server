import { z } from "zod";

export const LegalValidationSchema = z.object({
  serviceName: z.string().min(2, "Service name is required"),
  overview: z.string().min(6, "Overview should be at least 6 characters long"),
  features: z.array(z.string()).nonempty("At least one feature is required"), 
});

export type LegalServiceInput = z.infer<typeof LegalValidationSchema>;
