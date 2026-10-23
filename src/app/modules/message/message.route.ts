import { Router } from "express";
import { FileUploadHelper } from "../../helpers/filUploadHelper";
import { messageController } from "./message.controller";

const router = Router();

router.post(
  "/generate-url",
  FileUploadHelper.upload.any(),
  messageController.generateUploadUrl
);

export const messageRoutes = router;
