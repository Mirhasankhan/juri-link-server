import config from "../../config";
import { transferMoneyToConnectedLawyer } from "../../helpers/stripe.payment";
import AppError from "../../utils/AppError";
import { jwtHelpers } from "../../utils/jwtHelpers";
import { Withdraw } from "../earning/earning.model";
import { User } from "../user/user.model";
import { Admin, IAdmin } from "./admin.model";
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

const acceptWithdrawRequestFromDB = async (withdrawId: string) => {
  const session = await mongoose.startSession();

  return session.withTransaction(async () => {
    const pendingWithdraw = await Withdraw.findOne(
      { _id: withdrawId, status: "Pending" },
      null,
      { session }
    );

    if (!pendingWithdraw) {
      throw new AppError(404, "Withdraw request not found");
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
  acceptWithdrawRequestFromDB
};
