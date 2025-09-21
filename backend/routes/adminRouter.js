import { Router } from "express";
import { getPreferredProvider } from "../utilities/mailProvider.js";
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

export default adminRouter;
