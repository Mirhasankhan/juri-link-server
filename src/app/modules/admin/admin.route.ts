import express from "express";
import { adminController } from "./admin.controller";
import validateRequest from "../../middleware/validateRequest";
import { loginValidationSchema } from "../auth/auth.validation";
import { adminValidationSchema } from "./admin.validation";

const router = express.Router();
router.post(
  "/login",
  validateRequest(loginValidationSchema),
  adminController.adminLogin
);

router.post(
  "/create",
  validateRequest(adminValidationSchema),
  adminController.createAdmin
);

export const authRoutes = router;
