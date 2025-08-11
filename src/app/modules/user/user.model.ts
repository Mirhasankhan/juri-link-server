import { model, Schema } from "mongoose";
import { TUser } from "./user.interface";
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
    profileImage: { type: String },
    phone: { type: String },
    address: { type: String },
    licenceUrl: { type: String },
    barAssociation: { type: String },
    licenceNumber: { type: String },
    experience: { type: Number },
    serviceType: { type: String },
    specialization: { type: [String], default: [] },
    role: {
      type: String,
      enum: ["User", "Admin", "Lawyer"],
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const User = model<TUser>("User", userSchema);

const pendingUserSchema = new Schema<TUser>(
  {
    fullName: { type: String, required: [true, "Fullname is required"] },
    email: { type: String, required: [true, "Email is required"] },
    phone: { type: String, required: [true, "Phone number is required"] },
    password: { type: String, required: [true, "Password is required"] },
    role: {
      type: String,
      default: "User",
      enum: ["User", "Admin", "Lawyer"],
    },
    otp: { type: String },
    expiresAt: { type: Date, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const PendingUser = model<TUser>("PendingUser", pendingUserSchema);

const otpSchema = new Schema<TUser>(
  {
    email: { type: String, required: [true, "Email is required"] },
    otp: { type: String },
    expiresAt: { type: Date, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const Otp = model<TUser>("Otp", otpSchema);
