import authRouter from "./authRouter.js";
import teacherRouter from "./teacherRouter.js";
import adminRouter from "./adminRouter.js";
import { Router } from "express";

const appRouter = Router();

appRouter.use("/auth", authRouter);
appRouter.use("/teacher", teacherRouter);
appRouter.use("/admin", adminRouter);

appRouter.get("/", (req, res) => {
  res.status(200).json({ message: `/api/v1 route working` });
});

export default appRouter;
