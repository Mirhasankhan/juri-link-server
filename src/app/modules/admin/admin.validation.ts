import { z } from "zod";

const adminRoleEnum = z.enum(["UserAdmin", "FinanceAdmin"]);

export const adminValidationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  adminName: z.string().min(1, "Admin name is required"),
  role: adminRoleEnum,
});
