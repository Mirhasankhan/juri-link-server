import { Schema, model, Types } from "mongoose";

export interface TReview {
  userId: Types.ObjectId;
  bookingId: Types.ObjectId;
  comment: string;
  rating: number;
}

const ReviewSchema = new Schema<TReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
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