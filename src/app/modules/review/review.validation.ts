import { z } from "zod";
export const ReportTypeEnum = z.enum(["Harassment", "Excessively_Late", "Unprofessional_Behavior", "Low_Effort"]);



export const reviewValidationSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  comment: z.string().min(5, "Comment must be 10 characters long"),
  rating: z.number().min(1).max(5)
});
export const reportValidationSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  comment: z.string().min(5, "Comment must be 10 characters long"),
  reportType: ReportTypeEnum
});
