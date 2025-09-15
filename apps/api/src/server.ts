import { app } from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.API_PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server running on PORT: ${PORT}`);
});
