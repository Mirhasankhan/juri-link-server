import { model, Schema } from "mongoose";
import { TOtp, TPendingUser, TUser } from "./user.interface";

const userSchema = new Schema<TUser>(
  {
    fullName: { type: String, required: [true, "Full name is required"] },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please fill a valid email address",
      ],
    },
    password: { type: String, required: [true, "Password is required"] },
    stripeUserId: { type: String, required: true },
    stripeAccountId: { type: String },
    profileImage: { type: String },
    introVideo: { type: String },
    phone: { type: String },
    location: { type: String },
    about: { type: String },
    institute: { type: String },
    licenceUrl: { type: String },
    licenceNumber: { type: String },
    avgRating: { type: Number, default: 0 },
    allTimeEarning: { type: Number, default: 0 },
    currentEarning: { type: Number, default: 0 },
    totalReview: { type: Number, default: 0 },
    availabilitySetup: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Active", "Blocked"],
      default: "Active",
    },
    isSubscribed: { type: Boolean, default: false },
    experience: { type: Number },
    fee: { type: Number },
    serviceType: { type: String },
    specialization: { type: [String], default: [] },
    role: {
      type: String,
      enum: ["User", "Lawyer"],
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

export const User = model<TUser>("User", userSchema);

const pendingUserSchema = new Schema<TPendingUser>(
  {
    fullName: { type: String, required: [true, "Fullname is required"] },
    email: { type: String, required: [true, "Email is required"] },
    phone: { type: String, required: [true, "Phone number is required"] },
    password: { type: String, required: [true, "Password is required"] },
    licenceUrl: { type: String },
    location: { type: String },
    licenceNumber: { type: String },
    experience: { type: Number },
    fee: { type: Number },
    serviceType: { type: String },
    specialization: { type: [String], default: [] },
    role: {
      type: String,
      default: "User",
      enum: ["User", "Lawyer"],
    },
    otp: { type: String },
    expiresAt: { type: Date, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

pendingUserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PendingUser = model<TPendingUser>("PendingUser", pendingUserSchema);

const otpSchema = new Schema<TOtp>(
  {
    email: { type: String, required: [true, "Email is required"] },
    otp: { type: String },
    expiresAt: { type: Date, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = model<TOtp>("Otp", otpSchema);
