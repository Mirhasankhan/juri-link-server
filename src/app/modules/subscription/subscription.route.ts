import Express from "express";
import { subscriptionPlanController } from "./subscription.controller";
import auth from "../../middleware/auth";

const router = Express.Router();

router.post("/create", subscriptionPlanController.createSubscriptionPlan);
router.get("/", auth(), subscriptionPlanController.getSubscriptionPlans);
router.post("/checkout-session",auth("Lawyer"), subscriptionPlanController.createCheckoutSession);
router.delete("/cancel",auth("Lawyer"), subscriptionPlanController.cancelSubscription);

export const subscriptionPlanRoutes = router;
