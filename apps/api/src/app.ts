import express from "express";
import { plantsRouter } from "./routes/plants";

export const app = express();

app.use(express.json());

app.get("/health", (request, response) => {
  response.send({ status: 200, message: "it's working" });
});

// API endpoints
app.use("/api/v1/plants", plantsRouter);
