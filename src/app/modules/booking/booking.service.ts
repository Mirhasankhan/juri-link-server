import config from "../../config";
import { Earning } from "../earning/earning.model";
import { User } from "../user/user.model";
import { Booking, TBooking } from "./booking.model";
import Stripe from "stripe";
import mongoose from "mongoose";

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

  if (paymentIntent.status === "succeeded") {
    const newBooking = await Booking.create({
      ...payload,
      paymentIntentId: paymentIntent.id,
      fee: existingLawyer.fee,
      paymentMethodId: payload.paymentMethodId,
      userId,
    });
    return newBooking;
  } else {
    return "Something went wrong! Booking Failed";
  }
};

const getUserWiseBookingsFromDB = async (userId: string) => {
  const existingUser = await User.findById(userId).select("fullName profileImage");
  if (!existingUser) {
    throw new Error("User not found");
  }

  const bookings = await Booking.find({ userId })
    .select("time date fee serviceType status serviceId lawyerId")
    .populate({
      path: "serviceId",
      select: "serviceName", 
    })
    .populate({
      path: "lawyerId",
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
    const booking = await Booking.findById(bookingId).session(session);
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

export const bookingServices = {
  createBookingIntoDb,
  markBookingAsCompletedInDB,
  getUserWiseBookingsFromDB
};
