import { Schema, model, Types } from "mongoose";

interface TPost {
  title: string;
  category: string;
  description: string;
  budget: string;
  location: string;
  urgencyLevel: "Low" | "Medium" | "High";
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<TPost>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
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
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Post = model<TPost>("Post", postSchema);
