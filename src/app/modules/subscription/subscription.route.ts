import Express from "express";
import { subscriptionPlanController } from "./subscription.controller";
import auth from "../../middleware/auth";

const router = Express.Router();

router.post("/create", subscriptionPlanController.createSubscriptionPlan);
router.post("/checkout-session",auth("User"), subscriptionPlanController.createCheckoutSession);

export const subscriptionPlanRoutes = router;
