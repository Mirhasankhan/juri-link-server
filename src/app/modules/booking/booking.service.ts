import config from "../../config";
import { Earning } from "../earning/earning.model";
import { User } from "../user/user.model";
import { Booking, TBooking } from "./booking.model";
import Stripe from "stripe";
import mongoose from "mongoose";
import AppError from "../../utils/AppError";
import {
  cancelZoomMeeting,
  createZoomMeeting,
} from "../../helpers/zoom.helper";

const stripe = new Stripe(config.stripe.stripe_secret as string);

const createBookingIntoDb = async (userId: string, payload: TBooking) => {
  const existingUser = await User.findById(userId);
  if (!existingUser) {
    throw new Error("User not found");
  }
  const existingLawyer = await User.findById(payload.lawyerId);
  if (!existingLawyer) {
    throw new Error("Lawyer not found");
  }

  const serviceExists = existingLawyer.specialization.some(
    (service: string) => service.toString() === payload.serviceId.toString()
  );

  if (!serviceExists) {
    throw new Error("This lawyer does not provide the selected service");
  }

  await stripe.paymentMethods.attach(payload.paymentMethodId as string, {
    customer: existingUser?.stripeUserId as string,
  });

  const paymentIntent = await stripe.paymentIntents.create({
    amount: existingLawyer.fee! * 100,
    currency: "usd",
    customer: existingUser?.stripeUserId,
    confirm: true,
    payment_method: payload.paymentMethodId as string,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "never",
    },
  });

  let start_url = "";
  let join_url = "";

  if (paymentIntent.status === "succeeded") {
    if (payload.serviceType == "Online") {
      const response = await createZoomMeeting(
        "Law Consultation",
        "2025-11-21T18:30:00+06:00"
      );
      start_url = response.start_url;
      join_url = response.join_url;
    }
    console.log(start_url,join_url);
    const newBooking = await Booking.create({
      ...payload,
      paymentIntentId: paymentIntent.id,
      fee: existingLawyer.fee,
      startUrl: start_url,
      joinUrl: join_url,
      paymentMethodId: payload.paymentMethodId,
      userId,
    });

    return newBooking;
  } else {
    return "Something went wrong! Booking Failed";
  }
};

const getUserWiseBookingsFromDB = async (userId: string) => {
  const existingUser = await User.findById(userId).select(
    "fullName profileImage"
  );
  if (!existingUser) {
    throw new Error("User not found");
  }

  const bookings = await Booking.find({ userId })
    .select("time date fee serviceType status serviceId lawyerId joinUrl")
    .populate({
      path: "serviceId",
      select: "serviceName",
    })
    .populate({
      path: "lawyerId",
      select: "fullName profileImage location",
      model: "User",
    });

  return {
    bookings,
  };
};
const getLawyerWiseBookingsFromDB = async (lawyerId: string) => {
  const existingLawyer = await User.findById(lawyerId).select(
    "fullName profileImage"
  );
  if (!existingLawyer) {
    throw new Error("lawyer not found");
  }

  const bookings = await Booking.find({ lawyerId })
    .select("time date fee serviceType status serviceId startUrl userId")
    .populate({
      path: "serviceId",
      select: "serviceName",
    })
    .populate({
      path: "userId",
      select: "fullName profileImage",
      model: "User",
    });

  return {
    bookings,
  };
};

const markBookingAsCompletedInDB = async (bookingId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findOne({
      _id: bookingId,
      status: "Active",
    }).session(session);
    if (!booking) throw new Error("Booking not found");

    await Earning.create(
      [
        {
          lawyerId: booking.lawyerId,
          bookingId: booking._id,
          amount: booking.fee,
        },
      ],
      { session }
    );

    await Booking.updateOne(
      { _id: booking._id },
      { status: "Completed" },
      { session }
    );

    await User.updateOne(
      { _id: booking.lawyerId },
      {
        $inc: {
          allTimeEarning: booking.fee,
          currentEarning: booking.fee,
        },
      },
      { session }
    );

    await session.commitTransaction();
    return;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

const cancelBookingFromDB = async (payload: any) => {
  const booking = await Booking.findOne({
    _id: payload.bookingId,
    status: "Active",
  });

  if (!booking) {
    throw new AppError(404, "Booking not found");
  }

  const refund = await stripe.refunds.create({
    payment_intent: booking.paymentIntentId,
    amount: Math.floor(Number(booking.fee) * 100),
  });

  if (refund.status == "succeeded") {
    await Booking.updateOne(
      { _id: payload.bookingId },
      { $set: { status: "Cancelled", cancelReason: payload.cancelReason } }
    );
    const response = await cancelZoomMeeting("89174782204");
    console.log(response);
  }
  return;
};
const sendRefundRequestIntoDB = async (payload: any) => {
  const booking = await Booking.findOne({
    _id: payload.bookingId,
    status: "Completed",
  });

  if (!booking) {
    throw new AppError(
      404,
      "Booking unavailable: only completed bookings can be accessed at this stage"
    );
  }

  await Booking.updateOne(
    { _id: payload.bookingId },
    { $set: { status: "RefundRequest", refundReason: payload.refundReason } }
  );

  return;
};

export const bookingServices = {
  createBookingIntoDb,
  markBookingAsCompletedInDB,
  getUserWiseBookingsFromDB,
  sendRefundRequestIntoDB,
  cancelBookingFromDB,
  getLawyerWiseBookingsFromDB,
};
