import express from "express";
import http from "http";
import cors from "cors";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import appRouter from "./routes/index.js";
import { Server } from "socket.io";
import socketHandlers from "./socket/socketHandlers.js";
import cookieParser from "cookie-parser";
import { scheduleMailHealthCheck } from "./jobs/mailHealth.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
dotenv.config();

const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  optionsSuccessStatus: 200,
};

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
connectDB();
scheduleMailHealthCheck();

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/api/v1", appRouter);

app.get("/", (req, res) => {
  res.status(200).json({ message: `Healthy server running at port - ${PORT}` });
});

io.on("connection", (socket) => {
  console.log("Client connected: ", socket.id);
  socketHandlers(io, socket);
});

server.listen(PORT, () => {
  console.log(
    `Server + Socket running on port ${PORT} for course allocation app`,
  );
});
