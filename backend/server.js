import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

const app = express();
const PORT = process.env.PORT || 5000;
dotenv.config();

app.use(cors());
app.use(express.json());
connectDB();

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({ message: `Healthy server running at port - ${PORT}` });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
