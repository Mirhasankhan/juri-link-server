import { Schema, model, Types } from "mongoose";

export interface TBooking {
  userId: Types.ObjectId;
  lawyerId: Types.ObjectId;
  serviceId: Types.ObjectId;
  serviceType: "Online" | "In_Person" | "Both";
  status:
    | "Pending"
    | "Confirmed"
    | "Completed"
    | "Paid"
    | "Cancelled"
    | "RefundRequest"
    | "Refunded";
  time: string;
  date: Date;
  serviceDescription: string;
  refundReason?: string;
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
      enum: ["Online", "In_Person", "Both"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Completed",
        "Cancelled",
        "Paid",
        "Refunded",
        "RefundRequest",
      ],
      default: "Pending",
      required: true,
    },
    time: { type: String, required: true },
    date: { type: Date, required: true },
    serviceDescription: { type: String, required: true },
    refundReason: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Booking = model<TBooking>("Booking", BookingSchema);
