import AppError from "../../utils/AppError";
import { PendingUser, User } from "./user.model";
import bcrypt from "bcrypt";
import { TUser } from "./user.interface";

import generateOTP from "../../utils/generateOtp";
import sendEmail from "../../utils/email";
import { emailBody } from "../../middleware/EmailBody";
import { jwtHelpers } from "../../utils/jwtHelpers";
import config from "../../config";

const createPendingUserIntoDB = async (payload: TUser) => {
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new AppError(409, "Email already exists!");
  }
  const hashedPassword = bcrypt.hashSync(payload.password, 10);
  const otp = generateOTP();
  const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
  const expiresAt = Date.now() + OTP_EXPIRATION_TIME;
  const subject = "Your Account Verification OTP";
  const html = emailBody(payload.fullName, otp);

  await sendEmail(payload.email, subject, html);
  await PendingUser.findOneAndUpdate(
    { email: payload.email },
    {
      $set: {
        ...payload,
        password: hashedPassword,
        otp,
        expiresAt: new Date(expiresAt),
      },
    },
    { upsert: true, new: true }
  );
  return otp;
};
const resendVerifyOTP = async (email: string) => {
  const existingUser = await PendingUser.findOne({ email });

  if (!existingUser) {
    throw new AppError(409, "User not found!");
  }

  const otp = generateOTP();
  const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_TIME);

  const subject = "Your Account Verification OTP";
  const html = emailBody(existingUser.fullName, otp);

  await sendEmail(email, subject, html);
  await PendingUser.updateOne({ email }, { $set: { otp, expiresAt } });

  return otp;
};

const createUserIntoDB = async (email: string, otp: string) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(409, "User already exists!");
  }

  const userPending = await PendingUser.findOne({ email });
  if (!userPending) {
    throw new AppError(409, "User doesn't exist!");
  }

  const { expiresAt, fullName } = userPending;

  if (otp !== userPending.otp) {
    throw new AppError(401, "Invalid OTP.");
  }

  if (Date.now() > expiresAt.getTime()) {
    await PendingUser.deleteOne({ email: userPending.email });
    throw new AppError(410, "OTP has expired");
  }

  await PendingUser.deleteOne({ email });

  const user = await User.create({
    email: email,
    password: userPending.password,
    fullName,
    phoneNumber: userPending.phone,
    role: userPending.role,
  });

  const accessToken = jwtHelpers.generateToken(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string
  );
  const userObj = user.toObject();

  const { password, ...sanitizedUser } = userObj;

  return {
    accessToken,
    userInfo: sanitizedUser,
  };
};

const getProfileDetailsFromDb = async (userId: string) => {
  const user = await User.findById({
    _id: userId,
  });
  if (!user) {
    throw new AppError(404, "User not found");
  }
  const userObj = user.toObject();
  const { password, ...sanitizedUser } = userObj;

  return {
    sanitizedUser,
  };
};

export const userService = {
  createPendingUserIntoDB,
  createUserIntoDB,

  resendVerifyOTP,
  getProfileDetailsFromDb,
};
