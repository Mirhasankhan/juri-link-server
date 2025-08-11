import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import multer from "multer";
import streamifier from "streamifier";
import config from "../config";
import { IUploadFile } from "../interface/file";


cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
      "image/avif",
      "video/mp4",
      "video/mov",
      "video/avi",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images and videos are allowed."));
    }
  },
});

const uploadToCloudinary = async (
  files: IUploadFile[]
): Promise<UploadApiResponse[]> => {
  const uploadPromises = files.map((file) => {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: file.mimetype.startsWith("video") ? "video" : "image",
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Cloudinary upload failed"));
          } else {
            resolve(result);
          }
        }
      );

      streamifier.createReadStream(file.buffer).pipe(stream);
    });
  });

  return Promise.all(uploadPromises);
};

export const FileUploadHelper = {
  uploadToCloudinary,
  upload,
};