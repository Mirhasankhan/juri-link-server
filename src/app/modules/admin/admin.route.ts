import express from "express";
import { adminController } from "./admin.controller";
import validateRequest from "../../middleware/validateRequest";
import { loginValidationSchema } from "../auth/auth.validation";

const router = express.Router();
router.post(
  "/login",
  validateRequest(loginValidationSchema),
  adminController.adminLogin
);

export const authRoutes = router;
