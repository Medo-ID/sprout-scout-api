import express, { Express } from "express";
import { plantsRouter } from "./routes/plant";
import { authRouter } from "./routes/auth";
import { gardensRouter } from "./routes/garden";
import { checkAuth } from "./middlewares/auth";

export const app: Express = express();

app.use(express.json());

app.get("/", (request, response) => {
  response.send({ status: 200, message: "it's working" });
});

// API endpoints
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/plants", checkAuth, plantsRouter);
app.use("/api/v1/gardens", checkAuth, gardensRouter);
