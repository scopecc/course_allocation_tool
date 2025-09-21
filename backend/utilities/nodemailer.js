import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Resend } from "resend";
import { getPreferredProvider } from "./mailProvider.js";
dotenv.config();

const email = process.env.NODEMAILER_EMAIL;
const password = process.env.NODEMAILER_PASSWORD;

const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM;

let transporter;
if (email && password) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: password,
    },
  });
}

export default async function sendMail(to, sub, body) {
  const recipients = Array.isArray(to) ? to : [to];

  const preferred = await getPreferredProvider().catch(() => "nodemailer");

  const tryNodemailer = async () => {
    if (!transporter) throw new Error("Nodemailer not configured");
    const mailOptions = {
      from: email,
      to: recipients,
      subject: sub,
      html: body,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent (nodemailer): " + info.response);
  };

  const tryResend = async () => {
    if (!resendApiKey) throw new Error("Resend not configured");
    const resend = new Resend(resendApiKey);
    const fromAddress =
      resendFrom || (email ? email : undefined) || "no-reply@example.com";
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: recipients,
      subject: sub,
      html: body,
    });
    if (error) throw error;
    console.log("Email sent (Resend):", data?.id || "ok");
  };

  if (preferred === "nodemailer") {
    try {
      await tryNodemailer();
      return;
    } catch (e) {
      console.error("Nodemailer failed, trying Resend:", e);
      await tryResend();
      return;
    }
  } else {
    try {
      await tryResend();
      return;
    } catch (e) {
      console.error("Resend failed, trying Nodemailer:", e);
      await tryNodemailer();
      return;
    }
  }
}
