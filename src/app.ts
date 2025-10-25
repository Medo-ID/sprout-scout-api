import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { plantsRouter } from "./routes/plant";
import { authRouter } from "./routes/auth";
import { gardensRouter } from "./routes/garden";
import { checkAuth } from "./middlewares/auth";
import { userPlantRouter } from "./routes/user-plant";

export const app: Express = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.get("/check_health", (request, response) => {
  response.send({ status: 200, message: "it's working" });
});

// API endpoints
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/gardens", checkAuth, gardensRouter);
app.use("/api/v1/plants", checkAuth, plantsRouter);
app.use("/api/v1/user-plants", checkAuth, userPlantRouter);
