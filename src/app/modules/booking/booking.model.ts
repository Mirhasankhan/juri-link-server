import { Schema, model, Types } from "mongoose";

export interface TBooking {
  userId: Types.ObjectId;
  lawyerId: Types.ObjectId;
  serviceId: Types.ObjectId;
  serviceType: "Online" | "In_Person" | "Both";
  status: "Active" | "Completed" | "Cancelled" | "RefundRequest" | "Refunded";
  time: string;
  date: Date;
  paymentMethodId: string;
  paymentIntentId: string;
  serviceDescription: string;
  fee: Number;
  startUrl?: string;
  joinUrl?: string;
  refundReason?: string;
  isReviewed?: boolean;
  cancelReason?: string;
}

const BookingSchema = new Schema<TBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lawyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "LegalService",
      required: true,
    },
    serviceType: {
      type: String,
      enum: ["Online", "In_Person"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Cancelled", "Refunded", "RefundRequest"],
      default: "Active",
      required: true,
    },
    time: { type: String, required: true },
    paymentMethodId: { type: String, required: true },
    paymentIntentId: { type: String, required: true },
    date: { type: Date, required: true },
    serviceDescription: { type: String, required: true },
    fee: { type: Number, required: true },
    refundReason: { type: String },
    isReviewed: { type: Boolean },
    startUrl: { type: String },
    joinUrl: { type: String },
    cancelReason: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Booking = model<TBooking>("Booking", BookingSchema);
