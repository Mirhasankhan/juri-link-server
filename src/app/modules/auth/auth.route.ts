import express from "express";
import { authController } from "./auth.controller";
import auth from "../../middleware/auth";
import { FileUploadHelper } from "../../helpers/filUploadHelper";
import { parseBodyData } from "../../middleware/parseBodyData";

const router = express.Router();
router.post("/login", authController.loginUser);
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.patch("/reset-password", auth(), authController.resetPassword);
router.put(
  "/update",
  auth(),
  FileUploadHelper.upload.array("files", 1),
  parseBodyData,
  authController.updateUser
);

export const authRoutes = router;
