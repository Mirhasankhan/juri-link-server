import { z } from "zod";

export const UserRoleEnum = z.enum(["Admin", "User", "Lawyer"]);
export const ServiceTypeEnum = z.enum(["Online", "In_Person", "Both"]);

export const UserValidationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  phone: z.string().optional(),
  address: z.string().optional(),
  barAssociation: z.string().optional(),
  licenceNumber: z.string().optional(),
  experience: z.number().min(0, "Experience cannot be negative").optional(),
  serviceType: ServiceTypeEnum.optional(),
  specialization: z
    .array(z.string())
    .nonempty("At least one specialization is required").optional(),
  role: UserRoleEnum,
});

export type UserInput = z.infer<typeof UserValidationSchema>;
