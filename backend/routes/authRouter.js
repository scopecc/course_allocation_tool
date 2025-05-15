import { Router } from "express";

const authRouter = Router();

authRouter.get("/", (req, res) => {
  res.status(200).json({ message: "Auth route working" });
});

export default authRouter;
