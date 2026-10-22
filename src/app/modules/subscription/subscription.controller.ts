import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { subscriptionPlanServices } from "./subscription.service";

const createSubscriptionPlan = catchAsync(async (req, res) => {
  await subscriptionPlanServices.createSubscriptionPlanIntoDB(req);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Subscription plan created successfully",
  });
});
const getSubscriptionPlans = catchAsync(async (req, res) => {
  const result = await subscriptionPlanServices.getSubscriptionPlansFromDB(
    req.user.id
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Subscription plans retrieved successfully",
    data: result,
  });
});
const createCheckoutSession = catchAsync(async (req, res) => {
  const result = await subscriptionPlanServices.createCheckoutSession(
    req.body.priceId,
    req.user.id
  );
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Checkout session created",
    data: result,
  });
});
const cancelSubscription = catchAsync(async (req, res) => {
  await subscriptionPlanServices.cancelSubscriptionFromDB(req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Subscription cancelled created",
  });
});

export const subscriptionPlanController = {
  createSubscriptionPlan,
  getSubscriptionPlans,
  createCheckoutSession,
  cancelSubscription
};
