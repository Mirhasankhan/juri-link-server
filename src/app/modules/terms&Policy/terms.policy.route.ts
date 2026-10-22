import Express from "express";
import validateRequest from "../../middleware/validateRequest";
import { termPrivacyValidationSchema } from "./terms.policy.validation";
import { termsPrivacyController } from "./terms.policy.controller";
import auth from "../../middleware/auth";

const router = Express.Router();

router.post(
  "/create",
  auth("SuperAdmin"),
  validateRequest(termPrivacyValidationSchema),
  termsPrivacyController.termsAndPrivacy
);
router.get(
  "/",
  termsPrivacyController.getTermsAndPolicy
);

export const termPrivacyRoutes = router;
