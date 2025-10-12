import z from "zod";

export const plantsValidation = z
  .object({
    common_name: z.string(),
    family: z.string().optional(),
    cultivar: z.string().optional(),
    species_epithet: z.string().optional(),
    genus: z.string().optional(),
    watering_frequency_days: z.number().positive(),
    sunlight: z.array(z.string()).nullable(),
    external_api_id: z.number().nullable(),
    is_custom: z.boolean(),
    custom_watering_frequency_days: z.number().nullable(),
    default_image: z.string().optional(),
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
