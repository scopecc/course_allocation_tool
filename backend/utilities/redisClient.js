import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redisUrl = process.env.REDIS_URL || null;

let redis;
if (redisUrl) {
  redis = new Redis(redisUrl);
} else if (process.env.REDIS_HOST) {
  redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB || 0),
    lazyConnect: true,
  });
} else {
  // No Redis configured; create a disabled shim that throws on use
  redis = {
    get: async () => null,
    set: async () => null,
  };
}

export default redis;
