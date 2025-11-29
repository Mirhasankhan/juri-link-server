import Stripe from "stripe";
import config from "../config";
import sendResponse from "../utils/sendResponse";
import catchAsync from "../utils/catchAsync";
import { subscriptionPlanServices } from "../modules/subscription/subscription.service";

const stripe = new Stripe(config.stripe.stripe_secret as string);

const handleWebHook = catchAsync(async (req: any, res: any) => {
  const sig = req.headers["stripe-signature"] as string;
  console.log(sig);

  if (!sig) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Missing Stripe signature header.",
      data: null,
    });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.stripe.webhook_secret as string
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return res.status(400).send("Webhook Error: Invalid signature.");
  }

  switch (event.type) {
    // Account Events
    case "account.updated":
      console.log("Account updated:", event.data.object);
      break;
    case "account.application.authorized":
      console.log("Application authorized for account:", event.data.object);
      break;
    case "account.external_account.created":
      console.log("External account created:", event.data.object);
      break;

    //  Subscription & Recurring Payments
    case "invoice.payment_succeeded":
      const invoice: any = event.data.object as Stripe.Invoice;
      const metadata = invoice.lines?.data?.[0]?.metadata || {};
      const priceId = metadata.priceId as string;
      const userId = metadata.userId as string;
      const subscriptionPayId = invoice.subscription as string;

      //   await stripeService.handleSubscriptionCreated(
      //     priceId,
      //     userId,
      //     subscriptionPayId
      //   );
      break;
    case "invoice.payment_failed":
      const failedInvoice = event.data.object as Stripe.Invoice;
      const failedMetadata = failedInvoice.lines?.data?.[0]?.metadata || {};
      const failedPriceId = failedMetadata.priceId as string;
      const failedUserId = failedMetadata.userId as string;
      //   await stripeService.handleSubscriptionStatusUpdate(
      //     failedUserId,
      //     failedPriceId,
      //     "DEACTIVE"
      //   );
      break;
    case "customer.subscription.created":
      console.log("New subscription created:", event.data.object);
      break;
    case "customer.subscription.updated":
      console.log("Subscription updated:", event.data.object);
      break;
    case "customer.subscription.deleted":
      const subscription = event.data.object as Stripe.Subscription;
      const subscriptionMetadata = subscription.metadata || {};
      const deletedPriceId = subscriptionMetadata.priceId as string;
      const deletedUserId = subscriptionMetadata.userId as string;

      console.log(subscriptionMetadata, "kljsddfkljfsdkljsdfkjlkjlfsdkjlsdf");

      //   await stripeService.handleSubscriptionStatusUpdate(
      //     deletedUserId,
      //     deletedPriceId,
      //     "DEACTIVE"
      //   );
      break;

    // One-Time Payments
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
   
      const userId = session.metadata?.userId;
      const priceId = session.metadata?.priceId;
      const subscriptionPayId = session.subscription as string;

      await subscriptionPlanServices.handleSubscriptionCreated(
        priceId as string,
        userId as string,
        subscriptionPayId
      );

      break;
    }
    case "charge.succeeded":
      console.log("Charge succeeded:");
      break;
    case "charge.failed":
      console.log("Charge failed:", event.data.object);
      break;

    //  Refunds
    case "charge.refunded":
    case "charge.refund.updated":
      console.log("Charge refunded:", event.data.object);
      break;

    // Other Events
    case "capability.updated":
      console.log("Capability updated event received.");
      break;
    case "financial_connections.account.created":
      console.log("Financial connections account created.");
      break;
    case "customer.created":
      console.log("New customer created:", event.data.object);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).send("Event received");
});

export default handleWebHook;
