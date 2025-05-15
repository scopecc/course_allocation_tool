import { Router } from "express";
import { authControllers } from "../controllers/index.js";

const authRouter = Router();

authRouter.get("/", (req, res) => {
  res.status(200).json({ message: "Auth route working" });
});

authRouter.post("/signin", authControllers.signIn);

authRouter.post("/verify-otp", authControllers.verifyOtp);

export default authRouter;
