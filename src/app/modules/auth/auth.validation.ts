import { z } from "zod";

const locationUpdateSchema = z.object({
  latitude: z
    .number()
    .min(-90, "Latitude must be greater than or equal to -90")
    .max(90, "Latitude must be less than or equal to 90"),
  longitude: z
    .number()
    .min(-180, "Longitude must be greater than or equal to -180")
    .max(180, "Longitude must be less than or equal to 180"),
});

export const authValidation = {
  locationUpdateSchema,
};
