import express, { Router } from "express";
import { login, register } from "../controllers/auth.controller";

export const authRouter: Router = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
