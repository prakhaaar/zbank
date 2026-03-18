import { createClient } from "redis";
import env from "./env.js";

const redis = createClient({
  url: env.REDIS_URL,
  socket: {
    tls: true, // required for Upstash rediss://
    reconnectStrategy: (retries) => {
      if (retries > 5) return false;
      return Math.min(retries * 500, 3000);
    },
  },
});

redis.on("error", (err) => console.error("❌ Redis error:", err.message));
redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("reconnecting", () => console.log("🔄 Redis reconnecting..."));

(async () => {
  try {
    await redis.connect();
  } catch (err) {
    console.error("❌ Redis connection failed:", err.message);
  }
})();

export default redis;
