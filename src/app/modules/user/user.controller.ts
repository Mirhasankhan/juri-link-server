import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { userService } from "./user.service";

const createPendingUser = catchAsync(async (req, res) => {
  await userService.createPendingUserIntoDB(req);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "OTP Send Successfully",
    data: null,
  });
});
const resendOtp = catchAsync(async (req, res) => {
  await userService.resendVerifyOTP(req.body.email);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "OTP resend Successfully",
    data: null,
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
    message: "Userinfo retrieved successfull",
    data: user,
  });
});
const getLawyerDetails = catchAsync(async (req, res) => {
  const lawyer = await userService.getLawyerDetailsFromDb(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Lawyer details retrieved successfully",
    data: lawyer,
  });
});


const allUsers = catchAsync(async (req, res) => {
  const ratingStr = req.query.rating as string | undefined;
  const expStr = req.query.experience as string | undefined;
  const typeStr = req.query.type as string | undefined;
  const specStr = req.query.specializationId as string | undefined;

  const parsedRating = ratingStr && ratingStr !== "undefined" ? parseInt(ratingStr) : undefined;
  const parsedExp = expStr && expStr !== "undefined" ? parseInt(expStr) : undefined;
  const type = typeStr && typeStr !== "undefined" && typeStr.trim() !== "" ? typeStr : undefined;
  const specializationId = specStr && specStr !== "undefined" && specStr.trim() !== "" ? specStr : undefined;

  const user = await userService.getAllUsersFromDB(
    parsedRating && !isNaN(parsedRating) ? parsedRating : undefined,
    parsedExp && !isNaN(parsedExp) ? parsedExp : undefined,
    type,
    specializationId
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Userinfo retrieved successfully",
    data: user,
  });
});

export const userController = {
  createPendingUser,
  createUser,
  userInfo,
  getLawyerDetails,
  resendOtp,
  allUsers,
};
