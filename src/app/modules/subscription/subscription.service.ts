import Stripe from "stripe";
import { Request } from "express";

import AppError from "../../utils/AppError";
import config from "../../config";
import { Subscription, UserSubscription } from "./subscription.model";
import { User } from "../user/user.model";

const stripe = new Stripe(config.stripe.stripe_secret as string);

const createSubscriptionPlanIntoDB = async (req: Request) => {
  const { name, amount, interval, features, type } = req.body;

  const existingSubscription = await Subscription.findOne({
    type,
  });
  if (existingSubscription) {
    throw new AppError(400, `${type} subscription already exists`);
  }

  let product;
  try {
    product = await stripe.products.create({ name });
  } catch (error: any) {
    throw new AppError(400, "Stripe product creation failed: " + error.message);
  }

  let price;

  try {
    price = await stripe.prices.create({
      unit_amount: Number(amount) * 100,
      currency: "usd",
      recurring: { interval, interval_count: type == "Quarterly" ? 3 : 1 },
      product: product.id,
    });
  } catch (error: any) {
    throw new AppError(400, "Stripe price creation failed: " + error.message);
  }

  const newSubscription = await Subscription.create({
    title: name,
    features,
    priceId: price.id,
    productId: product.id,
    interval: price.recurring?.interval || null,
    type: type,
  });

  return newSubscription;
};

const getSubscriptionPlansFromDB = async (userId: string) => {
  const user = await User.findOne({ _id: userId, role: "Lawyer" });
  if (!user) throw new AppError(404, "Lawyer not found");

  const userSub = await UserSubscription.findOne({
    userId,
  }).lean();

  const plans = await Subscription.find().lean();

  const enrichedPlans = await Promise.all(
    plans.map(async (plan) => {
      const stripePrice = await stripe.prices.retrieve(plan.priceId);

      const isCurrent =
        userSub && String(userSub.subscriptionId) === String(plan._id);

      return {
        planId: plan._id,
        title: plan.title,
        type: plan.type,
        features: plan.features,
        price: stripePrice.unit_amount! / 100,
        priceId: plan.priceId,
        interval: plan.interval,
        userSubscription: isCurrent
          ? {
              subscriptionId: userSub.subscriptionId,
              subscriptionPayId: userSub.subscriptionPayId,
            }
          : null,
      };
    })
  );

  return enrichedPlans;
};

const createCheckoutSession = async (priceId: string, userId: string) => {
  const user = await User.findOne({
    _id: userId,
  });
  if (!user) {
    throw new AppError(404, "User not found");
  }

  const existingSubscription = await UserSubscription.findOne({
    userId,
    priceId,
    status: "ACTIVE",
  });

  if (existingSubscription) {
    throw new AppError(
      400,
      "User already has an active subscription for this plan."
    );
  }

  const successUrl = "https://api-topship.com/shipping/success";
  const cancelUrl = "https://api-topship.com/shipping/cancel";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: user.stripeUserId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl + `?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      priceId,
    },
  });

  return { url: session.url };
};
const handleSubscriptionCreated = async (
  priceId: string,
  userId: string,
  subscriptionPayId: string
) => {
  try {
    const subscription = await Subscription.findOne({ priceId });
    if (!subscription) {
      throw new AppError(
        404,
        `Subscription with priceId: ${priceId} not found`
      );
    }

    const result = await UserSubscription.findOneAndUpdate(
      { userId, priceId },
      {
        $set: {
          features: subscription.features || [],
          userId,
          priceId,
          subscriptionId: subscription._id,
          type: subscription.type,
          subscriptionPayId,
          status: "ACTIVE",
          // startDate: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await User.findByIdAndUpdate(userId, { isSubscribed: true });

    return result;
  } catch (error) {
    throw new AppError(500, "Failed to create or update the subscription");
  }
};

const cancelSubscriptionFromDB = async (userId: string) => {
  const userSubscription = await UserSubscription.findOne({
    userId,
    status: "ACTIVE",
  });
  if (!userSubscription) {
    throw new AppError(404, "User subscription not found");
  }
  const response = await stripe.subscriptions.cancel(
    userSubscription.subscriptionPayId
  );
  console.log(response);

  if (response.status == "canceled") {
    await User.updateOne(
      { _id: userId }, 
      { $set: { isSubscribed: false } } 
    );
    await UserSubscription.deleteOne({
      userId,
    });
    return;
  } else {
    throw new AppError(400, "Subscription cancellation failed");
  }
};

export const subscriptionPlanServices = {
  createSubscriptionPlanIntoDB,
  createCheckoutSession,
  handleSubscriptionCreated,
  cancelSubscriptionFromDB,
  getSubscriptionPlansFromDB,
};
