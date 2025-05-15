import { Router } from "express";

const teacherRouter = Router();

teacherRouter.get("/", (req, res) => {
  res.status(200).json({ message: "Teacher route working" });
});

export default teacherRouter;
