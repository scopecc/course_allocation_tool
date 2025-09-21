import cron from "node-cron";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { setPreferredProvider } from "../utilities/mailProvider.js";

const email = process.env.NODEMAILER_EMAIL;
const password = process.env.NODEMAILER_PASSWORD;
const resendApiKey = process.env.RESEND_API_KEY;

const transporter =
  email && password
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: email, pass: password },
      })
    : null;

async function verifyNodemailer() {
  if (!transporter) return false;
  try {
    await transporter.verify();
    return true;
  } catch {
    return false;
  }
}

async function verifyResend() {
  if (!resendApiKey) return false;
  try {
    const resend = new Resend(resendApiKey);
    // Light-touch verification: if constructing client throws or calling a cheap endpoint fails, treat as false.
    // Resend has no verify endpoint; we'll assume available if client can be constructed.
    return true;
  } catch {
    return false;
  }
}

export function scheduleMailHealthCheck() {
  // Every 2 hours at minute 0
  cron.schedule(
    "0 */2 * * *",
    async () => {
      try {
        const nodemailerOk = await verifyNodemailer();
        if (nodemailerOk) {
          await setPreferredProvider("nodemailer");
          return;
        }

        const resendOk = await verifyResend();
        if (resendOk) {
          await setPreferredProvider("resend");
        }
      } catch (e) {
        // swallow
      }
    },
    { timezone: "UTC" }
  );
}
