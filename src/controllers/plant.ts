import { Request, Response } from "express";
import { PlantsService } from "../services/plant";
import { ExternalPlant } from "../libs/types/external-api";
import z from "zod";

const plantService = new PlantsService();

export async function search(req: Request, res: Response) {
  const query = req.params.query;
  try {
    const result = await plantService.searchForPlants(query);
    res.status(201).json({
      message: "ok!",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function save(req: Request, res: Response) {
  const data: ExternalPlant[] = req.body;
  try {
    const result = await plantService.savePlants(data);
    res.status(201).json({
      message: "ok",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
