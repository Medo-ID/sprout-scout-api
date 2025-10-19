import express, { Router } from "express";
import { login, logout, refresh, register } from "../controllers/auth";

export const authRouter: Router = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
