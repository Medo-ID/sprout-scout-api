import z from "zod";

export interface PlantDTO {
  id: string;
  commonName: string;
  scientificName: string | null;
  wateringIntervalDays: number;
  sunlight: string | null;
  careInstructions: string | null;
  externalApiId: string | null;
  createdAt: Date;
}

export const plantsValidation = z.object({
  commonName: z.string(),
  scientificName: z.string().nullable(),
  wateringIntervalDays: z.number().positive(),
  sunlight: z.string().nullable(),
  careInstructions: z.string().nullable(),
  externalApiId: z.string().nullable(),
});

export type PlantSchema = z.infer<typeof plantsValidation>;
