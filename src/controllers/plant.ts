import { Request, Response } from "express";
import { PlantsService } from "../services/plant";
import { ExternalPlant } from "../libs/types/external-api";

const plantService = new PlantsService();

export async function search(req: Request, res: Response) {
  const query = req.body.query; // Changed from params to body since test sends query in body
  if (!query) {
    return res.status(400).json({
      message: "Missing search query",
    });
  }
  try {
    const result = await plantService.searchForPlants(query);
    return res.status(200).json({
      message: "ok!",
      data: result || [],
    });
  } catch (error: any) {
    console.error("Plant search error:", error);
    return res.status(500).json({ message: error.message });
  }
}

export async function save(req: Request, res: Response) {
  const data: ExternalPlant[] = req.body;
  if (!Array.isArray(data)) {
    return res.status(400).json({
      message: "Invalid input: expected array of plants",
    });
  }
  try {
    // Validate all plants in the array
    const invalidPlants = data.filter(
      (plant) => !plant.common_name || !plant.scientific_name || !plant.family
    );
    if (invalidPlants.length > 0) {
      return res.status(400).json({
        message: "Invalid plant data",
        errors: "Missing required fields in some plants",
      });
    }

    const result = await plantService.savePlants(data);
    return res.status(201).json({
      message: "ok",
      data: result || [],
    });
  } catch (error: any) {
    console.error("Plant save error:", error);
    return res.status(500).json({ message: error.message });
  }
}
