import express, { Router } from "express";
import { save, search } from "../controllers/plant";

export const plantsRouter: Router = express.Router();

plantsRouter.post("/?query", search);
plantsRouter.post("/", save);
