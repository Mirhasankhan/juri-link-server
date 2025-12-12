import config from "../../config";
import { transferMoneyToConnectedLawyer } from "../../helpers/stripe.payment";
import AppError from "../../utils/AppError";
import { jwtHelpers } from "../../utils/jwtHelpers";
import { Withdraw } from "../earning/earning.model";
import { User } from "../user/user.model";
import { Admin, IAdmin, TAdminRole } from "./admin.model";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

const loginAdminFromDB = async (email: string, password: string) => {
  const admin = await Admin.findOne({ email });

  if (!admin) throw new AppError(404, "Admin not found");

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    throw new AppError(401, "Invalid credentials");
  }

  const accessToken = jwtHelpers.generateToken(
    {
      id: admin._id,
      email: admin.email,
      role: admin.role,
      adminName: admin.adminName,
    },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string
  );

  return {
    accessToken,
  };
};

const createNewAdminIntoDB = async (payload: IAdmin) => {
  const existingAdmin = await Admin.findOne({ email: payload.email });

  if (existingAdmin) throw new AppError(409, "Admin already exists");

  const hashedPassword = bcrypt.hashSync(payload.password, 10);

  await Admin.create({
    adminName: payload.adminName,
    password: hashedPassword,
    role: payload.role,
    email: payload.email,
  });
  return;
};

const getAllUsersFromDB = async (search?: string) => {
  const matchStage: any = { role: "User" };

  if (search) {
    matchStage.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const result = await User.aggregate([
    { $match: matchStage },

    {
      $lookup: {
        from: "bookings",
        localField: "_id",
        foreignField: "userId",
        as: "bookings",
      },
    },

    {
      $addFields: {
        totalBookings: { $size: "$bookings" },
        totalSpending: { $sum: "$bookings.fee" },
      },
    },

    {
      $project: {
        fullName: 1,
        email: 1,
        phone: 1,
        location: 1,
        profileImage: 1,
        totalBookings: 1,
        totalSpending: 1,
        _id: 1,
      },
    },

    { $sort: { createdAt: -1 } },
  ]);

  return result;
};
const getAllLawyersFromDB = async (search?: string) => {
  const matchStage: any = { role: "Lawyer" };

  if (search) {
    matchStage.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const lawyers = await User.aggregate([
    { $match: matchStage },

    {
      $lookup: {
        from: "bookings",
        localField: "_id",
        foreignField: "lawyerId",
        as: "bookings",
      },
    },

    {
      $addFields: {
        totalBookings: { $size: "$bookings" },    
      },
    },

    {
      $project: {
        fullName: 1,
        email: 1,
        phone: 1,
        address: 1,
        profileImage: 1,
        location:1,
        avgRating:1,
        totalReview:1,
        availabilitySetup:1,
        introVideo: 1,
        allTimeEarning:1,
        totalBookings: 1,    
        _id: 1,
      },
    },

    { $sort: { createdAt: -1 } },
  ]);

  return lawyers;
};

const getAllAdminsFromDB = async (search?: string, role?: TAdminRole) => {
  const filter: any = {};

  if (search) {
    filter.$or = [
      { adminName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (role) {
    filter.role = role;
  }

  const admins = await Admin.find(filter).sort({ createdAt: -1 });

  return admins;
};

const deleteAdminFromDB = async (adminId: string) => {
  await Admin.deleteOne({
    _id: adminId,
  });

  return;
};

const getAllWithdrawRequestsFromDB = async (status?: string) => {
  const query: any = {};
  if (status) query.status = status;

  const withdraws = await Withdraw.find(query)
    .populate("lawyerId", "profileImage fullName email") 
    .exec();

  return withdraws;
};

const acceptWithdrawRequestFromDB = async (withdrawId: string) => {
  const session = await mongoose.startSession();

  return session.withTransaction(async () => {
    const pendingWithdraw = await Withdraw.findOne(
      { _id: withdrawId, status: "Pending" },
      null,
      { session }
    );

    if (!pendingWithdraw) {
      throw new AppError(404, "Withdraw request not found or already completed");
    }

    const lawyer = await User.findById(pendingWithdraw.lawyerId, null, {
      session,
    });
    if (!lawyer) {
      throw new AppError(404, "Lawyer not found");
    }

    const transfer = await transferMoneyToConnectedLawyer(
      lawyer.stripeAccountId,
      pendingWithdraw.amount
    );

    if (!transfer || transfer.reversed) {
      throw new AppError(400, "Stripe transfer failed");
    }
    lawyer.currentEarning =
      Number(lawyer.currentEarning) - pendingWithdraw.amount;

    await lawyer.save({ session });

    pendingWithdraw.status = "Accepted";
    await pendingWithdraw.save({ session });
  });
};

export const adminServices = {
  loginAdminFromDB,
  createNewAdminIntoDB,
  acceptWithdrawRequestFromDB,
  getAllAdminsFromDB,
  getAllUsersFromDB,
  getAllLawyersFromDB,
  deleteAdminFromDB,
  getAllWithdrawRequestsFromDB
};
