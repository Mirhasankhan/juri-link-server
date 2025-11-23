
import { ensureStripeAccountReady } from "../../helpers/stripe.payment";
import AppError from "../../utils/AppError";
import { User } from "../user/user.model";
import { Earning, Withdraw } from "./earning.model";
import {
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  getMonth,
  getDay,
} from "date-fns";

const SAUDI_OFFSET_HOURS = 3;

export const getLawyerEarningSummaryFromDB = async (
  lawyerId: string,
  type: "weekly" | "monthly"
) => {
  const lawyer = await User.findById(lawyerId).lean();
  if (!lawyer) throw new Error("Lawyer not found");

  const days = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let chartData: any[] = [];

  if (type === "weekly") {
    const start = startOfWeek(new Date(), { weekStartsOn: 6 });
    const end = endOfWeek(new Date(), { weekStartsOn: 6 });

    const earnings = await Earning.find({
      lawyerId,
      createdAt: { $gte: start, $lte: end },
    }).select("amount createdAt");

    const weeklyData = Array(7).fill(0);

    for (const e of earnings) {
      const localDate = new Date(
        e.createdAt.getTime() + SAUDI_OFFSET_HOURS * 60 * 60 * 1000
      );
      const dayIndex = getDay(localDate);
      const mappedIndex = (dayIndex + 6) % 7;
      weeklyData[mappedIndex] += e.amount;
    }

    chartData = days.map((day, idx) => ({
      day,
      earnings: weeklyData[idx],
    }));
  }

  if (type === "monthly") {
    const start = startOfYear(new Date());
    const end = endOfYear(new Date());

    const earnings = await Earning.find({
      lawyerId,
      createdAt: { $gte: start, $lte: end },
    }).select("amount createdAt");

    const monthlyData = Array(12).fill(0);

    for (const e of earnings) {
      const localDate = new Date(
        e.createdAt.getTime() + SAUDI_OFFSET_HOURS * 60 * 60 * 1000
      );
      const monthIndex = getMonth(localDate); // 0–11
      monthlyData[monthIndex] += e.amount;
    }

    chartData = months.map((m, idx) => ({
      month: m,
      earnings: monthlyData[idx],
    }));
  }

  return {
    currentEarnings: lawyer.currentEarning,
    allTimeEarnings: lawyer.allTimeEarning,
    chartData,
  };
};

const createWithdrawRequestIntoDB = async (lawyerId: string, amount: any) => {
  const lawyer = await User.findById(lawyerId);
  if (!lawyer) throw new AppError(404, "Lawyer not found");

  if (lawyer.currentEarning < amount)
    throw new AppError(400, "Insufficient balance");

  const pending = await Withdraw.findOne({ lawyerId, status: "Pending" });
  if (pending) throw new AppError(400, "Pending withdraw request exists");

  const onboardingUrl = await ensureStripeAccountReady(lawyer);
  if (onboardingUrl) throw new AppError(403, onboardingUrl);

  await Withdraw.create({
    lawyerId,
    amount,
  });

  return;
};

const getLawyerWiseWithdrawHistory = async (lawyerId: string) => {
  const lawyer = User.findById(lawyerId);
  if (!lawyer) throw new AppError(404, "Lawyer not found");

  const withdraws = await Withdraw.find({
    lawyerId,
  });

  return withdraws
};

export const earningServices = {
  createWithdrawRequestIntoDB,
  getLawyerWiseWithdrawHistory,
  getLawyerEarningSummaryFromDB,
};
