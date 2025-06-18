import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import appRouter from "./routes/index.js";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 5000;
dotenv.config();

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
connectDB();

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/api/v1", appRouter);

app.get("/", (req, res) => {
  res.status(200).json({ message: `Healthy server running at port - ${PORT}` });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
