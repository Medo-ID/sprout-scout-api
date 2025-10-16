import {
  createGarden,
  deleteGarden,
  getUserGarden,
  getUserGardens,
  updateGarden,
} from "@/controllers/garden.controller";
import express, { Router } from "express";

export const gardensRouter: Router = express.Router();

gardensRouter.get("/users/:user_id", getUserGardens);
gardensRouter.get("/:garden_id/users/:user_id", getUserGarden);
gardensRouter.post("/", createGarden);
gardensRouter.put("/:garden_id", updateGarden);
gardensRouter.delete("/:garden_id", deleteGarden);
