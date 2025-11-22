import { Types } from "mongoose";

export type TUserRole = "Admin" | "User" | "Lawyer";
export type TServiceType = "Online" | "In_Person" | "Both";

export type TUser = {
  _id?: Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  stripeUserId: string;
  profileImage?: string;
  phone?: string;
  about?: string;
  institute?: string;
  location?: string;
  licenceUrl?: string;
  licenceNumber?: string;
  currentEarning: Number;
  allTimeEarning: Number;
  experience?: number;
  fee?: number;
  availabilitySetup?: boolean;
  isSubscribed: boolean;
  avgRating: number;
  totalReview: number;
  serviceType?: TServiceType;
  specialization: string[];
  otp: string;
  expiresAt: Date;
  role: TUserRole;
  createdAt?: Date;
  updatedAt?: Date;
};
