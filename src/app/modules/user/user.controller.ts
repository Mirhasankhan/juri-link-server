import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { userService } from "./user.service";

const createPendingUser = catchAsync(async (req, res) => {
  const user = await userService.createPendingUserIntoDB(req);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "OTP Send Successfully",
    data: user,
  });
});
const resendOtp = catchAsync(async (req, res) => {
  const user = await userService.resendVerifyOTP(req.body.email);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "OTP resend Successfully",
    data: user,
  });
});

const createUser = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const user = await userService.createUserIntoDB(email, otp);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User verified Successfully",
    data: user,
  });
});

const userInfo = catchAsync(async (req, res) => {
  const user = await userService.getProfileDetailsFromDb(req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Userinfo retrived successfull",
    data: user,
  });
});
const allUsers = catchAsync(async (req, res) => {
  const rating = parseInt(req.query.rating as string);
  const type = req.query.type as string;
  const specializationId = req.query.specializationId as string;

  const user = await userService.getAllUsersFromDB(
    rating,
    type,
    specializationId
  );
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Userinfo retrived successfull",
    data: user,
  });
});

export const userController = {
  createPendingUser,
  createUser,
  userInfo,
  resendOtp,
  allUsers,
};
