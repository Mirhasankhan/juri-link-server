import express from "express";
import { authController } from "./auth.controller";
import auth from "../../middleware/auth";
import { FileUploadHelper } from "../../helpers/filUploadHelper";
import { parseBodyData } from "../../middleware/parseBodyData";
import validateRequest from "../../middleware/validateRequest";
import { loginValidationSchema, updateUserSchema } from "./auth.validation";

const router = express.Router();
router.post(
  "/login",
  validateRequest(loginValidationSchema),
  authController.loginUser
);
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.patch("/reset-password", auth(), authController.resetPassword);
router.put(
  "/update",
  auth(),
  validateRequest(updateUserSchema),
  authController.updateUser
);
router.put(
  "/upload/intro-video",
  auth(),
  FileUploadHelper.upload.array("files", 1),
  authController.uploadIntroVideo
);
router.put(
  "/upload/profileImage",
  auth(),
  FileUploadHelper.upload.array("files", 1),
  authController.uploadProfileImage
);

export const authRoutes = router;
