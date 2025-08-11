import multer from "multer";
import config from "../config";

// Ensure that the uploadSongDir is defined and valid (if needed)
if (!config.doBucketName || !config.doSpacesEndPoint) {
  throw new Error("DigitalOcean Spaces configuration is not properly set.");
}

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// Multer upload configuration with file filter for validation
export const uploadSong = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = /audio\/(mpeg|mp3|wav|ogg|aac)/;
    if (allowedFileTypes.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only audio files are allowed."));
    }
  },
  limits: { fileSize: 64 * 1024 * 1024 }, // 64 MB file size limit
});
