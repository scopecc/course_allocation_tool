import { Router } from "express";
import {
  getPreferredProvider,
  setPreferredProvider,
} from "../utilities/mailProvider.js";
import sendMail from "../utilities/nodemailer.js";

const adminRouter = Router();

adminRouter.get("/", (req, res) => {
  res.status(200).json({ message: "Admin route working" });
});

adminRouter.get("/mail/provider", async (req, res) => {
  try {
    const provider = await getPreferredProvider();
    return res.status(200).json({ provider });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to read provider", message: err.message });
  }
});

adminRouter.get("/mail/test", async (req, res) => {
  const to =
    typeof req.query.to === "string" ? req.query.to : "akkilalagar05@gmail.com";
  try {
    await sendMail(
      to,
      "Test Email - Course Allocation Tool",
      "<strong>This is a test email from the Course Allocation Tool.</strong>"
    );
    return res.status(200).json({ status: "sent", to });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to send test email", message: err.message });
  }
});

adminRouter.post("/mail/provider", async (req, res) => {
  const { provider, password } = req.body || {};
  const secret = process.env.MAIL_ADMIN_SECRET;

  if (!secret) {
    return res.status(500).json({ error: "MAIL_ADMIN_SECRET not configured" });
  }
  if (password !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (provider !== "nodemailer" && provider !== "resend") {
    return res.status(400).json({ error: "Invalid provider" });
  }

  try {
    await setPreferredProvider(provider);
    return res.status(200).json({ provider, status: "updated" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to set provider", message: err.message });
  }
});

export default adminRouter;
