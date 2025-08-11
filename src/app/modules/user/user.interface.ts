import { Types } from "mongoose";

export type TUserRole = "Admin" | "User" | "Lawyer";
export type TServiceType = "Criminal" | "Civil" | "Corporate" | "Other"; // example — adjust as needed

export type TUser = {
  _id?: Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  stripeUserId: string;
  profileImage?: string;
  phone?: string;
  address?: string;
  licenceUrl?: string;
  barAssociation?: string;
  licenceNumber?: string;
  experience?: number;
  serviceType?: TServiceType;
  specialization: string[];
  otp: string;
  expiresAt: Date;
  role: TUserRole;
  createdAt?: Date;
  updatedAt?: Date;
};
