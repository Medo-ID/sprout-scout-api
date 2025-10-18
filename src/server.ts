import { app } from "./app";
import dotenv from "dotenv";
import { initializeDB } from "./config/database";

dotenv.config();

const PORT = process.env.API_PORT || 3000;

app.listen(PORT, async () => {
  await initializeDB();
  console.log(`Server running on: http://localhost:${PORT}`);
});
