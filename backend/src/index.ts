import express, { Request, Response } from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors()); // Enable CORS for frontend

// Health check
app.get("/", (_req: Request, res: Response) => {
  res.send("API is running!");
});

// Get food list (Seafood category)
app.get("/food-list", async (_req: Request, res: Response) => {
  try {
    const response = await axios.get(
      "https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood"
    );
    res.json(response.data); // Send the whole "meals" array
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch food list" });
  }
});

// Get food details by ID
app.get("/food-details/:id", async (req: Request, res: Response) => {
  const mealId = req.params.id;

  try {
    const response = await axios.get(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
    );
    res.json(response.data); // Send the full meal details
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch food details" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
