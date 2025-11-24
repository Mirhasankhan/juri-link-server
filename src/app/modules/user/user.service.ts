import AppError from "../../utils/AppError";
import { PendingUser, User } from "./user.model";
import bcrypt from "bcrypt";
import generateOTP from "../../utils/generateOtp";
import sendEmail from "../../utils/email";
import { emailBody } from "../../middleware/EmailBody";
import { jwtHelpers } from "../../utils/jwtHelpers";
import config from "../../config";
import { createCustomerStripeAccount } from "../../helpers/stripe.payment";
import { FileUploadHelper } from "../../helpers/filUploadHelper";
import { Request } from "express";
import { IUploadFile } from "../../interface/file";
import { Review } from "../review/review.model";
import { LegalService } from "../legalServices/legalService.model";

const createPendingUserIntoDB = async (req: Request) => {
  const payload = req.body;
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

  const files = req.files as IUploadFile[] | undefined;

  if (files && files.length > 0) {
    const uploadedMedia = await FileUploadHelper.uploadToCloudinary(files);
    payload.licenceUrl = uploadedMedia[0].secure_url;
  }

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

  const stripeAccount = await createCustomerStripeAccount(
    userPending.email,
    userPending.fullName
  );

  await PendingUser.deleteOne({ email });

  const user = await User.create({
    email: email,
    password: userPending.password,
    fullName,
    phoneNumber: userPending.phone,
    stripeUserId: stripeAccount.id,
    licenceNumber: userPending.licenceNumber,
    location: userPending.location,
    licenceUrl: userPending.licenceUrl,
    specialization: userPending.specialization,
    serviceType: userPending.serviceType,
    experience: userPending.experience,
    fee: userPending.fee,
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

  const {
    password,
    _id,
    specialization,
    location,
    licenceNumber,
    licenceUrl,
    totalReview,
    avgRating,
    ...sanitizedUser
  } = userObj;

  return {
    accessToken,
    userInfo: sanitizedUser,
  };
};

const getProfileDetailsFromDb = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found");

  const userObj = user.toObject();
  const { password, ...sanitizedUser } = userObj;

  return {
    ...sanitizedUser,
  };
};

const getLawyerDetailsFromDb = async (lawyerId: string) => {
  const lawyer = await User.findOne({
    _id: lawyerId,
    role: "Lawyer",
  }).lean();

  if (!lawyer) throw new AppError(404, "Lawyer not found");

  const specializations = await LegalService.find(
    { _id: { $in: lawyer.specialization } },
    "serviceName"
  ).lean();

  const reviews = await Review.find({ userId: lawyerId })
    .populate("userId", "name email")
    .lean();

  const { password, ...sanitizedUser } = lawyer;

  return {
    lawyer: {
      ...sanitizedUser,
      specialization: specializations,
    },
    reviews,
  };
};

const getAllUsersFromDB = async (
  rating?: number,
  experience?: number,
  type?: string,
  specializationId?: string
) => {
  const filter: any = { role: "Lawyer" };

  if (rating) filter.avgRating = { $gte: rating };
  if (experience) filter.experience = { $gte: experience };
  if (type) filter.serviceType = type;
  if (specializationId) filter.specialization = specializationId;

  const users = await User.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "legalservices",
        let: { specializationIds: "$specialization" },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: [
                  "$_id",
                  {
                    $map: {
                      input: "$$specializationIds",
                      as: "specId",
                      in: {
                        $convert: {
                          input: "$$specId",
                          to: "objectId",
                          onError: null,
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
          { $project: { serviceName: 1 } },
        ],
        as: "legalServices",
      },
    },
    {
      $project: {
        fullName: 1,
        email: 1,
        avgRating: 1,
        fee: 1,
        experience: 1,
        serviceType: 1,
        specialization: 1,
        legalServices: 1,
        profileImage: 1,
      },
    },
  ]);

  return users;
};

export const userService = {
  createPendingUserIntoDB,
  createUserIntoDB,
  resendVerifyOTP,
  getProfileDetailsFromDb,
  getAllUsersFromDB,
  getLawyerDetailsFromDb,
};
