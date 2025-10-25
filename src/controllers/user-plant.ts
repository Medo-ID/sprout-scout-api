import { Request, Response } from "express";
import { userPlantValidation } from "../libs/schemas/user-plant";
import { UserPlantSchema } from "../libs/schemas/user-plant";
import { UserPlantRepository } from "../repositories/user-plant";
import z from "zod";

const userPlantRepo = new UserPlantRepository();

export async function addUserPlants(req: Request, res: Response) {
  const gardenId: string = req.params.garden_id;
  const data: UserPlantSchema[] = req.body;
  const validateResult = z.array(userPlantValidation).safeParse(data);

  if (!validateResult.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: z.prettifyError(validateResult.error),
    });
  }

  try {
    const result = await userPlantRepo.bulkInsert(
      gardenId,
      validateResult.data
    );
    res.status(201).json({
      message: "Plant(s) added to your garden!",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function removeUserPlants(req: Request, res: Response) {
  const ids: string[] = req.body;
  const validateResult = z.array(z.string()).safeParse(ids);

  if (!validateResult.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: z.prettifyError(validateResult.error),
    });
  }

  try {
    await userPlantRepo.delete(validateResult.data);
    res.status(201).json({
      message: "Plant(s) removed from your garden!",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
