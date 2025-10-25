import z from "zod";

export const userPlantValidation = z.object({
  plant_id: z.string(),
  planted_at: z.date().optional(),
});

export type UserPlantSchema = z.infer<typeof userPlantValidation>;
