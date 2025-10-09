import express, { Express } from "express";
import { plantsRouter } from "./routes/plants.route";
import { authRouter } from "./routes/auth.route";

export const app: Express = express();

app.use(express.json());

app.get("/health", (request, response) => {
  response.send({ status: 200, message: "it's working" });
});

// API endpoints
app.use("/api/v1/plants", plantsRouter);
app.use("/api/v1/auth", authRouter);
