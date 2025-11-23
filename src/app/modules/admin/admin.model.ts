import { Schema, model } from "mongoose";

export type TAdminRole = "SuperAdmin" | "UserAdmin" | "FinanceAdmin";

export interface IAdmin {
  adminName: string;
  email: string;
  password: string;
  profileImage?: string;
  role: TAdminRole;
}

const AdminSchema = new Schema<IAdmin>(
  {
    adminName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["SuperAdmin", "UserAdmin", "FinanceAdmin"],
      required: true,
    },
    profileImage: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Admin = model<IAdmin>("Admin", AdminSchema);
