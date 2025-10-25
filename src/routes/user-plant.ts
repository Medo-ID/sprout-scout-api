import express, { Router } from "express";
import { addUserPlants, removeUserPlants } from "../controllers/user-plant";

export const userPlantRouter: Router = express.Router();

userPlantRouter.post("/", addUserPlants);
userPlantRouter.delete("/", removeUserPlants);
