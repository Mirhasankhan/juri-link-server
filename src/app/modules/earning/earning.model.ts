import { Schema, model, Types, Document } from "mongoose";

export interface IEarning extends Document {
  lawyerId: Types.ObjectId;
  bookingId: Types.ObjectId;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  lawyer?: any;
  booking?: any;
}

// Mongoose schema
const earningSchema = new Schema<IEarning>(
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

export const Earning = model<IEarning>("Earning", earningSchema);
