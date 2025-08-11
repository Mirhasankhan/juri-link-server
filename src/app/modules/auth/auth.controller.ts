import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { authServices } from "./auth.service";

const loginUser = catchAsync(async (req, res) => {
  const result = await authServices.loginUserIntoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User logged in successfully",
    data: result,
  });
});

const sendOtp = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await authServices.sendForgotPasswordOtpDB(email);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Please check your email (${email}) to reset your password`,
    data: result,
  });
});
const verifyOtp = catchAsync(async (req, res) => {
  const result = await authServices.verifyForgotPasswordOtpCode(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `OTP verified successfully`,
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.user.id;
  await authServices.resetPasswordIntoDB(newPassword, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "password reset successfully",
  });
});

export const authController = {
  loginUser,
  sendOtp,
  verifyOtp,
  resetPassword,
};
