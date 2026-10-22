import Express from "express";
import validateRequest from "../../middleware/validateRequest";
import auth from "../../middleware/auth";
import {
  bookingValidationSchema,
  cancelValidationSchema,
  refundRequestSchema,
} from "./booking.validation";
import { bookingController } from "./booking.controller";
import { adminController } from "../admin/admin.controller";

const router = Express.Router();

router.post(
  "/create",
  auth("User"),
  validateRequest(bookingValidationSchema),
  bookingController.createBooking
);
router.post("/mark-completed/:id", auth(), bookingController.markCompleted);
router.put(
  "/cancel",
  auth(),
  validateRequest(cancelValidationSchema),
  bookingController.cancelBooking
);
router.put(
  "/refund-request",
  auth(),
  validateRequest(refundRequestSchema),
  bookingController.refundRequest
);
router.get("/user-wise", auth("User"), bookingController.userWiseBookings);
router.get(
  "/lawyer-wise",
  auth("Lawyer"),
  bookingController.lawyerWiseBookings
);
router.get(
  "/admin/earnings",
  auth("SuperAdmin", "UserAdmin", "FinanceAdmin"),
  adminController.adminEarnings
);

export const bookingRoutes = router;
