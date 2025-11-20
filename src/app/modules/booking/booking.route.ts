import Express from "express";
import validateRequest from "../../middleware/validateRequest";
import auth from "../../middleware/auth";
import { bookingValidationSchema } from "./booking.validation";
import { bookingController } from "./booking.controller";

const router = Express.Router();

router.post(
  "/create",
  auth("User"),
  validateRequest(bookingValidationSchema),
  bookingController.createBooking
);
router.post("/mark-completed/:id", auth(), bookingController.markCompleted);
router.get("/user-wise", auth("User"), bookingController.userWiseBookings);
router.get("/lawyer-wise", auth("Lawyer"), bookingController.lawyerWiseBookings);

export const bookingRoutes = router;
