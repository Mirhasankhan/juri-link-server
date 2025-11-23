import Express from "express";
import validateRequest from "../../middleware/validateRequest";
import auth from "../../middleware/auth";
import { reviewValidationSchema } from "./review.validation";
import { reviewController } from "./review.controller";

const router = Express.Router();

router.post(
  "/create",
  auth("User"),
  validateRequest(reviewValidationSchema),
  reviewController.createReview
);

export const reviewRoutes = router;
