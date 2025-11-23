import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { userRoute } from "../modules/user/user.route";
import { legalServiceRoutes } from "../modules/legalServices/legalService.route";
import { postRoutes } from "../modules/post/post.route";
import { bookingRoutes } from "../modules/booking/booking.route";
import { subscriptionPlanRoutes } from "../modules/subscription/subscription.route";
import { availabilityRoutes } from "../modules/availability/availability.route";
import { earningRoutes } from "../modules/earning/earning.route";

const router = Router();
const moduleRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/user",
    route: userRoute,
  },
  {
    path: "/legal-service",
    route: legalServiceRoutes,
  },
  {
    path: "/post",
    route: postRoutes,
  },
  {
    path: "/booking",
    route: bookingRoutes,
  },
  {
    path: "/subscription-plan",
    route: subscriptionPlanRoutes,
  },
  {
    path: "/availability",
    route: availabilityRoutes,
  },
  {
    path: "/earning",
    route: earningRoutes,
  },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
