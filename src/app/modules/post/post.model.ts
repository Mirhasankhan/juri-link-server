import { Schema, model, Types } from "mongoose";

export interface TPost {
  title: string;
  description: string;
  budget: string;
  location: string;
  urgencyLevel: "Low" | "Medium" | "High";
  userId: Types.ObjectId;
  serviceId: Types.ObjectId;
}

const postSchema = new Schema<TPost>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    budget: {
      type: String,
      required: [true, "Budget is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    urgencyLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: [true, "Urgency level is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "LegalService",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Post = model<TPost>("Post", postSchema);
