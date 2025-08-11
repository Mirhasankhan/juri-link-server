import Stripe from "stripe";
import config from "../config";

const stripe = new Stripe(config.stripe.stripe_secret as string);

export const createCustomerStripeAccount = async (
  email: string,
  name: string
) => {
  const account = await stripe.customers.create({
    email,
    name,
  });
  return account;
};
