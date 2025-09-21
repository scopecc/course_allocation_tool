import redis from "./redisClient.js";

const KEY = "mail:preferredProvider"; // values: 'nodemailer' | 'resend'
const DEFAULT_PROVIDER = "nodemailer";

export async function getPreferredProvider() {
  try {
    const value = await redis.get(KEY);
    if (value === "nodemailer" || value === "resend") return value;
  } catch {}
  return DEFAULT_PROVIDER;
}

export async function setPreferredProvider(provider) {
  try {
    await redis.set(KEY, provider);
  } catch {}
}
