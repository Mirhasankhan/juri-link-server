import Express from "express";
import validateRequest from "../../middleware/validateRequest";
import auth from "../../middleware/auth";
import { reportValidationSchema, reviewValidationSchema } from "./review.validation";
import { reviewController } from "./review.controller";
import { FileUploadHelper } from "../../helpers/filUploadHelper";
import { parseBodyData } from "../../middleware/parseBodyData";

const router = Express.Router();

router.post(
  "/create",
  auth("User"),
  validateRequest(reviewValidationSchema),
  reviewController.createReview
);
router.post(
  "/create-report",
  auth("User"),
  FileUploadHelper.upload.array("media", 1),
  parseBodyData,
  validateRequest(reportValidationSchema),
  reviewController.createReport
);

export const reviewRoutes = router;
