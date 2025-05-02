// backend/src/index.ts
import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.CORS_ORIGIN || "https://resturant-frontend.onrender.com"
      : "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// API endpoints
app.get("/food-list", async (req, res) => {
  try {
    const response = await axios.get(
      "https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood"
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching food list:", error);
    res.status(500).json({ error: "Failed to fetch food list" });
  }
});

app.get("/food-details/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const response = await axios.get(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching food details:", error);
    res.status(500).json({ error: "Failed to fetch food details" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
