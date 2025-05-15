import { Router } from "express";

const adminRouter = Router();

adminRouter.get("/", (req, res) => {
  res.status(200).json({ message: "Admin route working" });
});

export default adminRouter;
