import Express from "express";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";
import { FileUploadHelper } from "../../helpers/filUploadHelper";
import { parseBodyData } from "../../middleware/parseBodyData";

const router = Express.Router();

router.post(
  "/pending",
  FileUploadHelper.upload.array("files", 1),
  parseBodyData,
  userController.createPendingUser
);
router.post("/resend-otp", userController.resendOtp);
router.post("/create", userController.createUser);
router.get("/profile", auth(), userController.userInfo);

export const userRoute = router;
