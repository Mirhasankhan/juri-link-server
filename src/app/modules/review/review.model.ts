import { Schema, model, Types } from "mongoose";

export type TReportType =
  | "Harassment"
  | "Excessively_Late"
  | "Unprofessional_Behavior"
  | "Low_Effort";
export type TStatus =
  | "Pending"
  | "Got_Refund"
  | "Lawyer_Punished"
  | "False_Claim";

export interface TReview {
  userId: Types.ObjectId;
  lawyerId: Types.ObjectId;
  bookingId: Types.ObjectId;
  comment: string;
  rating: number;
}
export interface TReport {
  bookingId: Types.ObjectId;
  comment: string;
  media?: string;
  reportType: TReportType;
  status: TStatus;
  adminReply?: string;
}

const ReviewSchema = new Schema<TReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lawyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Review = model<TReview>("Review", ReviewSchema, "reviews");

const ReportSchema = new Schema<TReport>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    comment: { type: String, required: true },
    media: { type: String },
    adminReply: { type: String },
    status: { type: String, default: "Pending" },
    reportType: {
      type: String,
      enum: [
        "Harassment",
        "Excessively_Late",
        "Unprofessional_Behavior",
        "Low-Effort",
      ],
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Report = model<TReport>("Report", ReportSchema, "reports");
