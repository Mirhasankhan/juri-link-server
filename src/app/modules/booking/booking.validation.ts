import { z } from "zod";

const ServiceTypeEnum = z.enum(["Online", "In_Person"]);

export const bookingValidationSchema = z.object({
  lawyerId: z.string().min(1, "Lawyer ID is required"),
  serviceId: z.string().min(1, "Service ID is required"),
  serviceType: ServiceTypeEnum,
  time: z.string().min(1, "Booking time is required"),
  date: z.coerce.date({ invalid_type_error: "Invalid date format" }),
  serviceDescription: z
    .string()
    .min(5, "Description must be at least 5 characters"),
});
export const cancelValidationSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  cancelReason: z
    .string()
    .min(10, "Cancellation reason must be 10 characters long"),
});
export const refundRequestSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  refundReason: z
    .string()
    .min(10, "Refund request reason must be 10 characters long"),
});

export type BookingValidationType = z.infer<typeof bookingValidationSchema>;
