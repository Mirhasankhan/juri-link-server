import Stripe from "stripe";
import config from "../../config";
import { transferMoneyToConnectedLawyer } from "../../helpers/stripe.payment";
import AppError from "../../utils/AppError";
import { jwtHelpers } from "../../utils/jwtHelpers";
import { Booking } from "../booking/booking.model";
import { Withdraw } from "../earning/earning.model";
import { Report } from "../review/review.model";
import { User } from "../user/user.model";
import { Admin, IAdmin, TAdminRole } from "./admin.model";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { LegalService } from "../legalServices/legalService.model";

const stripe = new Stripe(config.stripe.stripe_secret as string);

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
    config.jwt.expires_in as string,
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

const getAllUsersFromDB = async (page: number = 1, search?: string) => {
  const limit = 10;
  const skip = (page - 1) * limit;

  const matchStage: any = {
    role: "User",
  };

  if (search) {
    matchStage.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [result] = await User.aggregate([
    {
      $match: matchStage,
    },

    {
      $facet: {
        data: [
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
              _id: 1,
              fullName: 1,
              email: 1,
              phone: 1,
              status: 1,
              location: 1,
              profileImage: 1,
              totalBookings: 1,
              totalSpending: 1,
              createdAt: 1,
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
        ],

        totalCount: [
          {
            $count: "count",
          },
        ],
      },
    },
  ]);

  const totalUsers = result.totalCount[0]?.count || 0;
  const totalPage = Math.ceil(totalUsers / limit);

  return {
    meta: {
      currentPage: page,
      totalPage,
      totalUsers,
    },
    data: result.data,
  };
};
const getAllLawyersFromDB = async (page: number = 1, search?: string) => {
  const limit = 10;
  const skip = (page - 1) * limit;

  const matchStage: any = {
    role: "Lawyer",
  };

  if (search) {
    matchStage.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [result] = await User.aggregate([
    {
      $match: matchStage,
    },

    {
      $facet: {
        data: [
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
              _id: 1,
              fullName: 1,
              email: 1,
              phone: 1,
              address: 1,
              status: 1,
              profileImage: 1,
              location: 1,
              avgRating: 1,
              totalReview: 1,
              availabilitySetup: 1,
              introVideo: 1,
              allTimeEarning: 1,
              totalBookings: 1,
              createdAt: 1,
            },
          },

          {
            $sort: {
              createdAt: -1,
            },
          },

          {
            $skip: skip,
          },

          {
            $limit: limit,
          },
        ],

        totalCount: [
          {
            $count: "count",
          },
        ],
      },
    },
  ]);

  const totalLawyers = result.totalCount[0]?.count || 0;
  const totalPage = Math.ceil(totalLawyers / limit);

  return {
    meta: {
      currentPage: page,
      totalPage,
      totalLawyers,
    },
    data: result.data,
  };
};

const getAllAdminsFromDB = async (
  page: number = 1,
  search?: string,
  role?: TAdminRole,
) => {
  const limit = 10;
  const skip = (page - 1) * limit;

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

  const [admins, totalAdmins] = await Promise.all([
    Admin.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),

    Admin.countDocuments(filter),
  ]);

  return {
    meta: {
      currentPage: page,
      totalPage: Math.ceil(totalAdmins / limit),
      totalAdmins,
    },
    data: admins,
  };
};

const deleteAdminFromDB = async (adminId: string) => {
  await Admin.deleteOne({
    _id: adminId,
  });

  return;
};

const getAllWithdrawRequestsFromDB = async (
  page: number = 1,
  status?: string
) => {
  const limit = 10;
  const skip = (page - 1) * limit;

  const query: any = {};

  if (status) {
    query.status = status;
  }

  const [withdraws, totalWithdrawRequests] = await Promise.all([
    Withdraw.find(query)
      .populate("lawyerId", "profileImage fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),

    Withdraw.countDocuments(query),
  ]);

  return {
    meta: {
      currentPage: page,
      totalPage: Math.ceil(totalWithdrawRequests / limit),
      totalWithdrawRequests,
    },
    data: withdraws,
  };
};

const acceptWithdrawRequestFromDB = async (withdrawId: string) => {
  const session = await mongoose.startSession();

  return session.withTransaction(async () => {
    const pendingWithdraw = await Withdraw.findOne(
      { _id: withdrawId, status: "Pending" },
      null,
      { session },
    );

    if (!pendingWithdraw) {
      throw new AppError(
        404,
        "Withdraw request not found or already completed",
      );
    }

    const lawyer = await User.findById(pendingWithdraw.lawyerId, null, {
      session,
    });
    if (!lawyer) {
      throw new AppError(404, "Lawyer not found");
    }

    if (!lawyer.stripeAccountId) {
      throw new AppError(400, "Lawyer does not have a connected Stripe account");
    }

    if (Number(lawyer.currentEarning) < pendingWithdraw.amount) {
      throw new AppError(
        400,
        "Lawyer has insufficient balance for this withdrawal"
      );
    }

    const transfer = await transferMoneyToConnectedLawyer(
      lawyer.stripeAccountId,
      pendingWithdraw.amount,
      `withdraw_${withdrawId}`
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

const getAllReportsFromDB = async (page: number = 1, status?: string) => {
  const limit = 10;
  const skip = (page - 1) * limit;

  const query: any = {};

  if (status) {
    query.status = status;
  }

  const [reports, totalReports] = await Promise.all([
    Report.find(query)
      .populate({
        path: "bookingId",
        select: "serviceType date time userId lawyerId",
        populate: [
          {
            path: "userId",
            select: "profileImage fullName email",
          },
          {
            path: "lawyerId",
            select: "profileImage fullName email",
          },
        ],
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),

    Report.countDocuments(query),
  ]);

  return {
    meta: {
      currentPage: page,
      totalPage: Math.ceil(totalReports / limit),
      totalReports,
    },
    data: reports,
  };
};

const responseToReportIntoDB = async (payload: any) => {
  const report = await Report.findOne({
    _id: payload.reportId,
    status: "Pending",
  });

  if (!report) {
    throw new AppError(404, "Report not found or already responded");
  }

  const booking = await Booking.findById(report.bookingId);

  if (!booking || !booking.paymentIntentId) {
    throw new AppError(404, "Booking or payment not found");
  }

  if (payload.status === "Got_Refund") {
    const refund = await stripe.refunds.create({
      payment_intent: booking.paymentIntentId,
    });

    if (refund.status !== "succeeded") {
      throw new AppError(400, "Refund failed");
    }

    await User.updateOne(
      { _id: booking.lawyerId },
      {
        $inc: {
          currentEarning: -booking.fee,
          allTimeEarning: -booking.fee,
        },
      },
    );
  }

  await Report.updateOne(
    { _id: payload.reportId },
    {
      $set: {
        status: payload.status,
        adminReply: payload.adminReply,
      },
    },
  );

  return;
};

const getDashboardOverviewFromDB = async () => {
  const totalUsers = await User.countDocuments({ role: "User" });
  const totalExpert = await User.countDocuments({ role: "Lawyer" });
  const totalServices = await LegalService.countDocuments();
  const totalConsultation = await Booking.countDocuments({
    status: "Completed",
  });

  return {
    totalUsers,
    totalExpert,
    totalServices,
    totalConsultation,
  };
};

const blockUnblockUserFromDB = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found");

  user.status = user.status === "Active" ? "Blocked" : "Active";
  await user.save();

  return {
    message: `User has been ${user.status === "Active" ? "unblocked" : "blocked"} successfully`,
  };
};

const getAdminProfileFromDB = async (adminId: string) => {
  const admin = await Admin.findById(adminId).select("-password");
  if (!admin) {
    throw new AppError(404, "Admin not found");
  }
  return admin;
};

const getAdminEarningsFromDB = async () => {
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const earnings = await Booking.aggregate([
    {
      $match: {
        status: "Completed",
        date: { $gte: startOfYear, $lte: endOfYear },
      },
    },
    {
      $group: {
        _id: { $month: "$date" },
        earning: { $sum: "$fee" },
      },
    },
  ]);

  const earningsMap = new Map<number, number>();
  earnings.forEach((item) => {
    earningsMap.set(item._id, item.earning);
  });

  const result = monthNames.map((month, idx) => ({
    month,
    earning: earningsMap.get(idx + 1) || 0,
  }));

  return result;
};

export const adminServices = {
  loginAdminFromDB,
  createNewAdminIntoDB,
  getAllReportsFromDB,
  acceptWithdrawRequestFromDB,
  getAllAdminsFromDB,
  getAllUsersFromDB,
  getAllLawyersFromDB,
  responseToReportIntoDB,
  deleteAdminFromDB,
  getAllWithdrawRequestsFromDB,
  getDashboardOverviewFromDB,
  blockUnblockUserFromDB,
  getAdminProfileFromDB,
  getAdminEarningsFromDB,
};
