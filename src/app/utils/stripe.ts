import Stripe from "stripe";
import config from "../config";

const stripe = new Stripe(config.stripe.stripe_secret!, {
  apiVersion: "2025-06-30.basil",
});

export const createConnectedAccount = async (workerEmail: string) => {
  const account = await stripe.accounts.create({
    type: "express",
    country: "US",
    email: workerEmail,
    capabilities: {
      transfers: { requested: true },
    },
  });

  return account.id;
};

export default stripe;
