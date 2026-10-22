import { S3Client, S3ClientConfig, ObjectCannedACL } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import path from "path";
import config from "../config";

const DO_CONFIG = {
  endpoint: config.doSpacesEndPoint,
  region: config.doSpacesRegion,
  credentials: {
    accessKeyId: config.doAccessKey || "",
    secretAccessKey: config.doSecretKey || "",
  },
  spaceName: config.doBucketName,
};

const s3Config: S3ClientConfig = {
  endpoint: DO_CONFIG.endpoint,
  region: DO_CONFIG.region,
  credentials: DO_CONFIG.credentials,
  forcePathStyle: true,
};

const s3 = new S3Client(s3Config);

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB limit

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mpeg",
  "video/mp4",
  "audio/mpeg",
  "audio/mp3",
  "video/x-matroska",
  "audio/mpeg",
  "application/zip",
  "application/pdf",
];

/**
 * Uploads a file buffer to DigitalOcean Spaces and returns the file URL.
 * @param {Express.Multer.File} file - The file object from multer
 * @returns {Promise<string>} - The URL of the uploaded file
 * @throws {Error} - If file validation fails or upload fails
 */
export const uploadInSpace = async (
  file: Express.Multer.File,
  folder: string
): Promise<string> => {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new Error("File type not allowed");
    }

    // Generate a unique filename with original extension
    const fileExtension = path.extname(file.originalname);
    const fileName = `uploads/${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}${fileExtension}`;

    const uploadParams = {
      Bucket: DO_CONFIG.spaceName,
      Key: fileName,
      Body: file.buffer,
      ACL: "public-read" as ObjectCannedACL,
      ContentType: file.mimetype,
    };

    const upload = new Upload({
      client: s3,
      params: uploadParams,
    });

    const data = await upload.done();

    const fileUrl =
      data.Location ||
      `${DO_CONFIG.endpoint}/${DO_CONFIG.spaceName}/${fileName}`;

    return fileUrl;
  } catch (error) {
    // console.error("Error uploading file to DigitalOcean Spaces:", error);
    throw new Error(
      error instanceof Error
        ? `Failed to upload file: ${error.message}`
        : "Failed to upload file to DigitalOcean Spaces"
    );
  }
};
