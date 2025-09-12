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

export const subscriptionPlanController = {
  createSubscriptionPlan,
  createCheckoutSession
};
