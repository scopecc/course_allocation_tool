import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const email = process.env.NODEMAILER_EMAIL || "akkilalagar05@gmail.com";
const password = process.env.NODEMAILER_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass: password,
  },
});

export default async function sendMail(to, sub, body) {
  try {
    const mailOptions = {
      from: email,
      to: to,
      subject: sub,
      html: body,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Failed to send email");
  }
}
