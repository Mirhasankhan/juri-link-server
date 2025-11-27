import Express from "express";
import validateRequest from "../../middleware/validateRequest";
import { termPrivacyValidationSchema } from "./terms.policy.validation";
import { termsPrivacyController } from "./terms.policy.controller";

const router = Express.Router();

router.post(
  "/create",
  validateRequest(termPrivacyValidationSchema),
  termsPrivacyController.termsAndPrivacy
);
router.get(
  "/",
  termsPrivacyController.getTermsAndPolicy
);

export const termPrivacyRoutes = router;
