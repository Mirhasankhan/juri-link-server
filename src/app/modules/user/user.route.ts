import Express from "express";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";
import { FileUploadHelper } from "../../helpers/filUploadHelper";
import { parseBodyData } from "../../middleware/parseBodyData";
import validateRequest from "../../middleware/validateRequest";
import { UserValidationSchema } from "./user.validation";
import rateLimiter from "../../middleware/rateLimiter";

const router = Express.Router();

router.post(
  "/request",
  FileUploadHelper.upload.array("licenceUrl", 1),
  parseBodyData,
  validateRequest(UserValidationSchema),
  userController.createPendingUser
);
router.post("/resend-otp",rateLimiter(1, 3), userController.resendOtp);
router.post("/verify",rateLimiter(1, 3), userController.createUser);
router.get("/profile", auth(), userController.userInfo);
router.get("/details/:id", userController.getLawyerDetails);
router.get("/all", rateLimiter(1, 5), userController.allUsers);

export const userRoute = router;
