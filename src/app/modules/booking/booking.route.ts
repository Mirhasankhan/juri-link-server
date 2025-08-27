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

export const bookingRoutes = router;
