import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { userRoute } from "../modules/user/user.route";

const router = Router();
const moduleRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/users",
    route: userRoute,
  },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
