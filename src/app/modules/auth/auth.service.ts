import bcrypt from "bcrypt";
import config from "../../config";
import AppError from "../../utils/AppError";
import { Otp, User } from "../user/user.model";
import sendEmail from "../../utils/email";
import generateOTP from "../../utils/generateOtp";
import { jwtHelpers } from "../../utils/jwtHelpers";
import { emailBodyOtp } from "../../middleware/EmailBody";
import { IUploadFile } from "../../interface/file";
import { FileUploadHelper } from "../../helpers/filUploadHelper";
import { Request } from "express";

const loginUserIntoDB = async (payload: any) => {
  const user = await User.findOne({ email: payload.email });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordValid) {
    throw new AppError(401, "Invalid credentials");
  }

  const accessToken = jwtHelpers.generateToken(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string
  );
  const userObj = user.toObject();
  const { password, ...userInfo } = userObj;

  return {
    accessToken,
    userInfo,
  };
};

const sendForgotPasswordOtpDB = async (email: string) => {
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw new AppError(404, "User not found");
  }

  const otp = generateOTP();
  const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
  const expiresAt = Date.now() + OTP_EXPIRATION_TIME;

  const subject = "Your Password Reset OTP";
  const html = emailBodyOtp(existingUser.fullName, otp);

  await sendEmail(email, subject, html);

  await Otp.findOneAndUpdate(
    { email },
    { otp, expiresAt: new Date(expiresAt) },
    { upsert: true, new: true }
  );

  return otp;
};

const verifyForgotPasswordOtpCode = async (payload: any) => {
  const { email, otp } = payload;

  if (!email || !otp) {
    throw new AppError(400, "Email and OTP are required.");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(404, "User not found");
  }
  const verifyData = await Otp.findOne({ email });
  if (!verifyData) {
    throw new AppError(400, "Invalid or expired OTP.");
  }
  const { expiresAt } = verifyData;

  if (otp !== verifyData.otp) {
    throw new AppError(401, "Invalid OTP.");
  }

  if (Date.now() > expiresAt.getTime()) {
    await Otp.deleteOne({ email });
    throw new AppError(410, "OTP has expired. Please request a new OTP.");
  }
  await Otp.deleteOne({ email });

  const accessToken = jwtHelpers.generateToken(
    { id: user._id, email },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string
  );

  return { accessToken };
};

const resetPasswordIntoDB = async (newPassword: string, userId: string) => {
  const existingUser = await User.findById(userId);
  if (!existingUser) {
    throw new AppError(404, "User not found");
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.jwt.gen_salt)
  );

  existingUser.password = hashedPassword;
  await existingUser.save();

  return;
};

const updateUserDetailsIntoDB = async (req: Request) => {
  const payload = req.body;
  const userId = req.user.id;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, "User not found");
  }

  const files = req.files as IUploadFile[] | undefined;

  if (files && files.length > 0) {
    const uploadedMedia = await FileUploadHelper.uploadToCloudinary(files);
    payload.profileImage = uploadedMedia[0].secure_url;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: payload },
    { new: true, runValidators: true }
  );

  return updatedUser;
};
const uploadIntroVideoIntoDB = async (req: Request) => {
  const userId = req.user.id;
  let introVideoLink = "";

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, "User not found");
  }

  const files = req.files as IUploadFile[] | undefined;

  if (files && files.length > 0) {
    const uploadedMedia = await FileUploadHelper.uploadToCloudinary(files);
    introVideoLink = uploadedMedia[0].secure_url;
  }

  if (!introVideoLink) {
    throw new AppError(404, "Intro video required");
  }

  await User.findByIdAndUpdate(userId, {
    $set: { introVideo: introVideoLink },
  });

  return;
};
export const authServices = {
  loginUserIntoDB,
  sendForgotPasswordOtpDB,
  verifyForgotPasswordOtpCode,
  uploadIntroVideoIntoDB,
  resetPasswordIntoDB,
  updateUserDetailsIntoDB,
};
