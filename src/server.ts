import mongoose from "mongoose";
import config from "./app/config";
import app from "./app";
import { Server } from "http";
import { setupWebSocketServer } from "./app/modules/socket/socket.controller";
import redisClient from "./app/utils/redis";
import seedSuperAdmin from "./app/config/seeSuperAdmin";

main().catch((err) => console.log(err));

async function main() {
  try {
    await mongoose.connect(config.database_URL as string);
    console.log("✅ Database connected to MongoDB");

    mongoose.connection.on("error", (err) => {
      console.error("Database connection error:", err);
    });
    const server: Server = app.listen(config.port, () => {
      console.log(`✅ Server is running on port ${config.port}`);
    });

    await seedSuperAdmin()

    // await redisClient.connect();

    setupWebSocketServer(server);
  } catch (err: any) {
    console.error("Error in database connection:", err.message);
  }
}
