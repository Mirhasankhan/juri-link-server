import { z } from "zod";

const adminRoleEnum = z.enum(["User", "Lawyer"]);

export const loginValidationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

