import z from "zod";

export const plantsValidation = z.object({
  id: z.uuidv4(),
  common_name: z.string(),
  scientific_name: z.string().nullable(),
  watering_interval_days: z.number().positive(),
  sunlight: z.string().nullable(),
  care_instructions: z.string().nullable(),
  external_api_id: z.string().nullable,
  created_at: z.date(),
});

export type PlantSchema = z.infer<typeof plantsValidation>;
