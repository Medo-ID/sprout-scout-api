import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import z from "zod";
import { GardenSchema, gardenValidation } from "../libs/schemas/garden";
import { GardenRepository } from "../repositories/garden";

const gardenRepo = new GardenRepository();

export async function getUserGardens(req: Request, res: Response) {
  const userId = req.params.user_id;

  if (!userId) {
    return res.status(400).json({
      message: "Missing user id",
      userId,
    });
  }

  try {
    const result = await gardenRepo.findAllByUserId(userId);
    if (!result || result.length === 0) {
      return res.status(200).json({
        message: "user's gardens data",
        data: [],
      });
    }
    return res.status(200).json({
      message: "user's gardens data",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function getUserGarden(req: Request, res: Response) {
  const userId = req.params.user_id;
  const gardenId = req.params.garden_id;

  if (!userId || !gardenId) {
    return res.status(400).json({
      message: "Missing user/garden id",
      ids: { userId, gardenId },
    });
  }

  try {
    const result = await gardenRepo.findOneByUserId(userId, gardenId);
    if (!result) {
      return res.status(404).json({
        message: "gardens not found",
        ids: { userId, gardenId },
      });
    }
    return res.status(200).json({
      message: "garden data",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function createGarden(req: Request, res: Response) {
  // prefer authenticated user id over body user_id when available
  const bodyData: GardenSchema = req.body;
  const authReq = req as AuthRequest;
  const data: GardenSchema = {
    ...bodyData,
    user_id: authReq.user?.userId || bodyData.user_id,
  };
  const validateResult = gardenValidation.safeParse(data);

  if (!validateResult.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: z.prettifyError(validateResult.error),
    });
  }

  try {
    const result = await gardenRepo.create(data);
    res.status(201).json({
      message: "Garden created!",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateGarden(req: Request, res: Response) {
  const gardenId = req.params.garden_id;
  const data: Partial<GardenSchema> = req.body;
  const validateResult = gardenValidation.partial().safeParse(data);

  if (!validateResult.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: z.prettifyError(validateResult.error),
    });
  }

  try {
    const result = await gardenRepo.update(data, gardenId);
    if (!result) {
      return res.status(404).json({
        message: "Garden not found",
        data,
      });
    }
    return res.status(200).json({
      message: "Garden updated!",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function deleteGarden(req: Request, res: Response) {
  const gardenId = req.params.garden_id;

  if (!gardenId) {
    return res.status(400).json({
      message: "Messing garden id parameter",
      gardenId,
    });
  }

  try {
    const result = await gardenRepo.delete(gardenId);
    if (!result) {
      return res.status(404).json({
        message: "Garden not found",
        gardenId,
      });
    }
    return res.status(200).json({
      message: "Garden deleted!",
      gardenId,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
