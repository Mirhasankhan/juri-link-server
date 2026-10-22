import mongoose from "mongoose";
import { model } from "mongoose";

const RoomSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Types.ObjectId, ref: "User" },
    receiverId: { type: mongoose.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

RoomSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

export const Room = model("Room", RoomSchema);

const MessageSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Types.ObjectId, ref: "Room" },
    senderId: { type: mongoose.Types.ObjectId },
    receiverId: { type: mongoose.Types.ObjectId },
    content: String,
    fileUrl: [String],
  },
  { timestamps: true }
);

export const Message = model("Message", MessageSchema);
