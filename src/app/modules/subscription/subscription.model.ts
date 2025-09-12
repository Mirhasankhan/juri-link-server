import { Schema, model, Types } from "mongoose";
type TPaymentStatus = "ACTIVE" | "DEACTIVE";

export interface TSubscription {
  title: string;
  subscriptionTitleType: string;
  features: string[];
  priceId: string;
  productId: string;
  interval: string | null;
  type: "SUBSCRIPTION";
}
export interface TUserSubscription {
  userId: Types.ObjectId;
  subscriptionId: Types.ObjectId;
  subscriptionTitleType: string;
  priceId: string;
  subscriptionPayId: string;
  features: string[];
  status: TPaymentStatus;
}

const SubscriptionPlanSchema = new Schema<TSubscription>(
  {
    title: { type: String, required: true },
    subscriptionTitleType: { type: String, required: true, unique: true },
    features: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "Atleast one features is needed",
      },
    },
    priceId: { type: String, required: true },
    productId: { type: String, required: true },
    interval: { type: String, default: null },
    type: { type: String, enum: ["SUBSCRIPTION"], required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Subscription = model<TSubscription>(
  "SubscriptionPlan",
  SubscriptionPlanSchema
);

// user subscriptions schema

const UserSubscriptionSchema = new Schema<TUserSubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    subscriptionTitleType: { type: String, required: true },
    priceId: { type: String, required: true },
    subscriptionPayId: { type: String, required: true },
    features: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "Features array cannot be empty",
      },
    },
    status: { type: String, enum: ["ACTIVE", "DEACTIVE"], default: "ACTIVE" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

UserSubscriptionSchema.index(
  { userId: 1, subscriptionId: 1 },
  { unique: true }
);
UserSubscriptionSchema.index({ userId: 1, priceId: 1 }, { unique: true });

export const UserSubscription = model<TUserSubscription>(
  "UserSubscription",
  UserSubscriptionSchema
);
