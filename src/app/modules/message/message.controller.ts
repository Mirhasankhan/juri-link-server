import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { FileUploadHelper } from "../../helpers/filUploadHelper";
import AppError from "../../utils/AppError";
import { IUploadFile } from "../../interface/file";

const generateUploadUrl = catchAsync(async (req: Request, res: Response) => {
  let files: IUploadFile[] = [];

  if (Array.isArray(req.files)) {
    files = req.files as IUploadFile[];
  } else if (req.files && typeof req.files === "object") {
    // Handling multiple named fields
    for (const key of Object.keys(req.files)) {
      const fieldFiles = (req.files as any)[key];
      if (Array.isArray(fieldFiles)) {
        files.push(...(fieldFiles as IUploadFile[]));
      }
    }
  } else if (req.file) {
    files = [req.file as IUploadFile];
  }

  if (!files || files.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "No file uploaded");
  }

  const uploadedMedia = await FileUploadHelper.uploadToCloudinary(files);

  if (!uploadedMedia || uploadedMedia.length === 0) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to upload image");
  }

  const fileUrl = uploadedMedia[0].secure_url;

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Image uploaded successfully",
    data: {
      fileUrl,
      url: fileUrl,
    },
  });
});

export const messageController = {
  generateUploadUrl,
};
