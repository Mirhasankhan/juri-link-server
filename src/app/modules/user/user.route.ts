import Express from "express";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";
import { FileUploadHelper } from "../../helpers/filUploadHelper";
import { parseBodyData } from "../../middleware/parseBodyData";
import validateRequest from "../../middleware/validateRequest";
import { UserValidationSchema } from "./user.validation";

const router = Express.Router();

router.post(
  "/request",
  FileUploadHelper.upload.array("licenceUrl", 1),
  parseBodyData,
  validateRequest(UserValidationSchema),
  userController.createPendingUser
);
router.post("/resend-otp", userController.resendOtp);
router.post("/verify", userController.createUser);
router.get("/profile", auth(), userController.userInfo);
router.get("/all", userController.allUsers);

export const userRoute = router;
