import express from "express";
import { authController } from "./auth.controller";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { authValidation } from "./auth.validation";
import { fileUploader } from "../../utils/fileUploader";

const router = express.Router();
router.post("/login", authController.loginUser);
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.patch("/reset-password", auth(), authController.resetPassword);



export const authRoutes = router;
