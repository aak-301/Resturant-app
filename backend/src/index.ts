import express, { Request, Response } from "express";

const app = express();
const PORT = 5000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello");
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
