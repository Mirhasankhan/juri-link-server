import { z } from "zod";

const ServiceTypeEnum = z.enum(["Online", "In_Person", "Both"]);

export const bookingValidationSchema = z.object({
  lawyerId: z.string().min(1, "Lawyer ID is required"),
  serviceId: z.string().min(1, "Service ID is required"),
  serviceType: ServiceTypeEnum,
  time: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](\s?(AM|PM))?$/,
      "Invalid time format (expected HH:mm or HH:mm AM/PM)"
    ),
  date: z.coerce.date({ invalid_type_error: "Invalid date format" }),
  serviceDescription: z
    .string()
    .min(5, "Description must be at least 5 characters")
});


export type BookingValidationType = z.infer<typeof bookingValidationSchema>;
