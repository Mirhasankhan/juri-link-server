import { z } from "zod";

export const UrgencyLevelEnum = z.enum(["Low", "Medium", "High"]);
export const ServiceTypeEnum = z.enum(["Online", "In_Person", "Both"]);

export const PostValidationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .min(6, "Description must be at least 6 characters long"),
  budget: z.string().min(1, "Budget is required"),
  location: z.string().min(2, "Location is required"),
  urgencyLevel: UrgencyLevelEnum,
  serviceType: ServiceTypeEnum,
});

export type PostInput = z.infer<typeof PostValidationSchema>;
