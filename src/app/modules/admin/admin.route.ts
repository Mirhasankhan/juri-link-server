import express from "express";
import { adminController } from "./admin.controller";
import validateRequest from "../../middleware/validateRequest";
import { loginValidationSchema } from "../auth/auth.validation";
import {
  adminValidationSchema,
  responseValidationSchema,
} from "./admin.validation";
import auth from "../../middleware/auth";

const router = express.Router();
router.post(
  "/login",
  validateRequest(loginValidationSchema),
  adminController.adminLogin
);

router.post(
  "/create",
  auth("SuperAdmin"),
  validateRequest(adminValidationSchema),
  adminController.createAdmin
);

router.get("/all", auth("SuperAdmin"), adminController.allAdmins);
router.get(
  "/all-users",
  auth("SuperAdmin", "UserAdmin"),
  adminController.allUsers
);
router.get(
  "/all-lawyers",
  auth("SuperAdmin", "UserAdmin"),
  adminController.allLawyers
);
router.get(
  "/withdraw-requests",
  auth("SuperAdmin", "UserAdmin"),
  adminController.withdrawRequests
);
router.delete("/delete/:id", auth("SuperAdmin"), adminController.deleteAdmin);
router.post(
  "/withdraw-request/accept/:id",
  auth("SuperAdmin", "FinanceAdmin"),
  adminController.acceptWithdrawRequest
);
router.get(
  "/reports",
  auth("SuperAdmin", "UserAdmin"),
  adminController.allReports
);
router.put(
  "/response-report",
  auth("SuperAdmin", "UserAdmin"),
  validateRequest(responseValidationSchema),
  adminController.responseToReport
);

export const adminRoutes = router;
