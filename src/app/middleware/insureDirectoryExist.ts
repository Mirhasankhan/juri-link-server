// app/middleware/ensureDirectoryExists.ts
import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import config from "../config";

// Ensure that the importSongsDir is defined and valid
if (!config.importSongsDir) {
  throw new Error("Import songs directory is not configured.");
}

// Middleware to ensure the directory exists
const ensureDirectoryExists = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const importSongsDir = path.resolve(config.importSongsDir);

  if (!fs.existsSync(importSongsDir)) {
    try {
      fs.mkdirSync(importSongsDir, { recursive: true });
      console.log(`Directory ${importSongsDir} created successfully.`);
    } catch (error) {
      console.error(`Failed to create directory ${importSongsDir}:`, error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to create directory." });
    }
  }

  next();
};

export default ensureDirectoryExists;
