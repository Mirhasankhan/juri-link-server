import config from "../../config";
import { User } from "../user/user.model";
import { Booking, TBooking } from "./booking.model";
import Stripe from "stripe";

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
      paymentMethodId: payload.paymentMethodId,
      userId,
    });
    return newBooking;
  } else {
    return "Something went wrong! Booking Failed";
  }
};

export const bookingServices = {
  createBookingIntoDb,
};
