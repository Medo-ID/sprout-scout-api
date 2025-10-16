import z from "zod";

export const gardenValidation = z.object({
  user_id: z.string(),
  name: z
    .string()
    .min(4, { message: "name must contain at least 4 characters" }),
  location: z.string().optional(),
});

export type GardenSchema = z.infer<typeof gardenValidation>;
