import Express from "express";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";

const router = Express.Router();

router.post("/pending", userController.createPendingUser);
router.post("/resend-otp", userController.resendOtp);
router.post("/create", userController.createUser);
router.get("/profile",auth(), userController.userInfo);

export const userRoute = router;
