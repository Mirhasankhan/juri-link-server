import { z } from "zod";

export const loginValidationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});



export const updateUserSchema = z.object({
  fullName: z.string().optional(),
  phone: z.string().optional(),
  about: z.string().optional(),
  institute: z.string().optional(),
  location: z.string().optional(),
  licenceNumber: z.string().optional(),
  experience: z.number().optional(),
  fee: z.number().optional(),
  serviceType: z.string().optional(),
  specialization: z.array(z.string()).optional(),
});

