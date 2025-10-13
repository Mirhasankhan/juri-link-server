import { Schema, model } from "mongoose";
import { TPost, TComment, TReply } from "./post.interface";

//post schema
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
    serviceType: {
      type: String,
      enum: ["Online", "In_Person", "Both"],
      required: [true, "Service type is required"],
    },
    status: {
      type: String,
      enum: ["Active", "Flagged", "Deleted"],
      default: "Active",
    },
    likedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "postId",
});

//comment schema
const commentSchema = new Schema<TComment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

commentSchema.virtual("replies", {
  ref: "Reply",
  localField: "_id",
  foreignField: "commentId",
});

//Reply Schema

const replySchema = new Schema<TReply>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Post = model<TPost>("Post", postSchema);
export const Comment = model<TComment>("Comment", commentSchema);
export const Reply = model<TReply>("Reply", replySchema);
