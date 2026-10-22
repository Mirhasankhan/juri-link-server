import { z } from "zod";

const keyEnum = z.enum(["Terms", "Privacy"]);

export const termPrivacyValidationSchema = z.object({
  key: keyEnum,
  content: z.string().min(10, "Content must be 10 characters long"),
});
