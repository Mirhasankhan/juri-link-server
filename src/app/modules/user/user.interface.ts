import { Types } from "mongoose";

export type TUserRole = "User" | "Lawyer";
export type TServiceType = "Online" | "In_Person" | "Both";
export type TStatus = "Active" | "Blocked"

export type TUser = {
  _id?: Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  stripeAccountId?: string;
  stripeUserId: string;
  profileImage?: string;
  introVideo?: string;
  phone?: string;
  about?: string;
  institute?: string;
  location?: string;
  licenceUrl?: string;
  licenceNumber?: string;
  currentEarning: number;
  allTimeEarning: number;
  experience?: number;
  fee?: number;
  availabilitySetup?: boolean;
  isSubscribed: boolean;
  avgRating: number;
  totalReview: number;
  serviceType?: TServiceType;
  status?: TStatus;
  specialization: string[];
  role: TUserRole;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TPendingUser = {
  _id?: Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  licenceUrl?: string;
  location?: string;
  licenceNumber?: string;
  experience?: number;
  fee?: number;
  serviceType?: string;
  specialization?: string[];
  role: TUserRole;
  otp?: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TOtp = {
  _id?: Types.ObjectId;
  email: string;
  otp?: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
};


