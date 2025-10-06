import z from "zod";

export interface Plant {
  id: string;
  name: string;
  watering_frequency_days: number;
  sunlight: string | null;
  care_instructions: string | null;
  external_api_id: string | null;
  is_custom: boolean;
  custom_watering_frequency_days: number | null;
  created_at: Date;
}

export const plantsValidation = z
  .object({
    name: z.string(),
    watering_frequency_days: z.number().positive(),
    sunlight: z.string().nullable(),
    care_instructions: z.string().nullable(),
    is_custom: z.boolean(),
    custom_watering_frequency_days: z.number().nullable(),
    external_api_id: z.string().nullable(),
  })
  .refine(
    (data) =>
      data.is_custom === false || data.custom_watering_frequency_days !== null,
    {
      message: "Custom plants must define a watering frequency!",
      path: ["custom_watering_frequency_days"],
    }
  );

export type PlantSchema = z.infer<typeof plantsValidation>;
