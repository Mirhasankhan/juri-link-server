import { Types, Document } from "mongoose";

export interface TEarning extends Document {
  lawyerId: Types.ObjectId;
  bookingId: Types.ObjectId;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  lawyer?: any;
  booking?: any;
}


export interface TWithdraw extends Document {
  lawyerId: Types.ObjectId;
  amount: number;
  status: "Pending" | "Accepted" | "Rejected";
  createdAt: Date;
  updatedAt: Date;
}