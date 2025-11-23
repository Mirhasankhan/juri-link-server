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

export const createStripeOneTimePaymentIntent = async (
  paymentMethodId: string,
  stripeUserId: string,
  fee: number
) => {
  await stripe.paymentMethods.attach(paymentMethodId as string, {
    customer: stripeUserId as string,
  });

  const paymentIntent = await stripe.paymentIntents.create({
    amount: fee * 100,
    currency: "usd",
    customer: stripeUserId,
    confirm: true,
    payment_method: paymentMethodId as string,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "never",
    },
  });
  return paymentIntent;
};

export const ensureStripeAccountReady = async (lawyer: any) => {
  if (!lawyer.stripeAccountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: lawyer.email,
    });

    lawyer.stripeAccountId = account.id;
    await lawyer.save();

    return generateOnboardingLink(account.id);
  }

  const account = await stripe.accounts.retrieve(lawyer.stripeAccountId);
  if (!account.charges_enabled) {
    return generateOnboardingLink(lawyer.stripeAccountId);
  }

  return null;
};

const generateOnboardingLink = async (accountId: string) => {
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: "https://yourdomain.com/reauth",
    return_url: "http://72.60.125.50:5003/account/connect/success",
    type: "account_onboarding",
  });

  return link.url;
};

export const transferMoneyToConnectedLawyer = async (
  stripeAccountId: string,
  amount: number
) => {
  const transfer = await stripe.transfers.create({
    amount: Math.round(amount * 100),
    currency: "usd",
    destination: stripeAccountId,
  });

  return transfer;
};
