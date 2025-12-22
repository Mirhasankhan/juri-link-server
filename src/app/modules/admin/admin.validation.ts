import { z } from "zod";

const adminRoleEnum = z.enum(["UserAdmin", "FinanceAdmin"]);
const reportStatusEnum = z.enum([
  "Got_Refund",
  "Lawyer_Punished",
  "False_Claim",
]);

export const adminValidationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  adminName: z.string().min(1, "Admin name is required"),
  role: adminRoleEnum,
});
export const responseValidationSchema = z.object({
  adminReply: z.string().min(1, "Reply message is required"),
  reportId: z.string().min(1, "Report ID is required"),
  status: reportStatusEnum,
});
