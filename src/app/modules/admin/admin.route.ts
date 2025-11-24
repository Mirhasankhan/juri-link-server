import express from "express";
import { adminController } from "./admin.controller";
import validateRequest from "../../middleware/validateRequest";
import { loginValidationSchema } from "../auth/auth.validation";
import { adminValidationSchema } from "./admin.validation";
import auth from "../../middleware/auth";

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
router.post(
  "/withdraw-request/accept/:id",
  auth("SuperAdmin", "FinanceAdmin"),
  adminController.acceptWithdrawRequest
);

export const adminRoutes = router;
