import { Schema, model, Types, Document } from "mongoose";
import { TEarning, TWithdraw } from "./earning.interface";



// Mongoose schema
const earningSchema = new Schema<TEarning>(
  {
    lawyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    amount: { type: Number, required: true },
  },
  {
    timestamps: true,
    collection: "earnings",
  }
);

export const Earning = model<TEarning>("Earning", earningSchema);

const withdrawSchema = new Schema<TWithdraw>(
  {
    lawyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export const Withdraw = model<TWithdraw>("Withdraw", withdrawSchema);

