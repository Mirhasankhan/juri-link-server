import { Schema, Types } from "mongoose";

export interface TPost {
  title: string;
  description: string;
  budget: string;
  location: string;
  status: "Active" | "Flagged" | "Deleted";
  urgencyLevel: "Low" | "Medium" | "High";
  userId: Types.ObjectId;
   serviceType: { type: String },
  serviceId: Types.ObjectId;
  likedUsers: Types.ObjectId[];
}

export interface TComment {
  userId: Schema.Types.ObjectId;
  postId: Schema.Types.ObjectId;
  message: string;
}

export interface TReply {
  userId: Schema.Types.ObjectId;
  commentId: Schema.Types.ObjectId;
  message: string;
}
