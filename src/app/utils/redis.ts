import { createClient } from "redis";
import config from "../config";

const redisClient = createClient({
  url: config.redisUrl,
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redisClient.on("error", (err) => {
  console.error("Redis connection error ❌", err);
});

export default redisClient;