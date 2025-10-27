import AppError from "../../utils/AppError";
import { User } from "../user/user.model";
import { TComment, TPost, TReply } from "./post.interface";
import { Comment, Post, Reply } from "./post.model";
import { Types } from "mongoose";

const createPostIntoDB = async (userId: string, payload: TPost) => {
  const existingUser = await User.findOne({ _id: userId });
  if (!existingUser) {
    throw new AppError(404, "user not found");
  }
  await Post.create({
    ...payload,
    userId,
  });

  return;
};

const getAllPostsFromDB = async (
  serviceId?: string,
  search?: string,
  level?: string
) => {
  const filter: any = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (serviceId) {
    filter.serviceId = serviceId;
  }

  if (level) {
    filter.urgencyLevel = level;
  }

  const posts = await Post.find(filter)
    .populate("serviceId", "serviceName -_id")
    .populate("userId", "fullName profileImage -_id")
    .populate({
      path: "comments",
      select: "_id -postId",
    });

  return posts;
};

const getPostDetailsFromDB = async (postId: string) => {
  const post = await Post.findOne({ _id: postId })
    .select("likedUsers") 
    .populate("userId", "fullName profileImage")
    .populate({
      path: "comments",
      populate: [
        { path: "userId", select: "fullName profileImage" },
        {
          path: "replies",
          populate: { path: "userId", select: "fullName profileImage" },
        },
      ],
    });

  if (!post) {
    throw new AppError(404, "post not found");
  }

  return post;
};


const handleLikeUnlikePostIntoDB = async (userId: string, postId: string) => {
  const user = await User.findById(userId);
  const post = await Post.findById(postId);

  if (!user) {
    throw new AppError(404, "User not found");
  }
  if (!post) {
    throw new AppError(404, "Post not found");
  }

  const userObjectId = new Types.ObjectId(userId);

  if (post.likedUsers.includes(userObjectId)) {
    await Post.findByIdAndUpdate(
      postId,
      { $pull: { likedUsers: userId } },
      { new: true }
    );
    return { message: "Post disliked successfully" };
  } else {
    await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { likedUsers: userId } },
      { new: true }
    );
    return { message: "Post liked successfully" };
  }
};

const deletePostFromDB = async (postId: string) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError(404, "Post not found");
  }

  await Post.deleteOne({ _id: postId });
  return;
};

const createCommentIntoDB = async (userId: string, payload: TComment) => {
  const existingUser = await User.findOne({ _id: userId });
  if (!existingUser) {
    throw new AppError(404, "user not found");
  }

  const existingPost = await Post.findOne({ _id: payload.postId });
  if (!existingPost) {
    throw new AppError(404, "post not found");
  }

  const comment = await Comment.create({
    userId,
    postId: payload.postId,
    message: payload.message,
  });

  return comment;
};

const createReplyIntoDB = async (userId: string, payload: TReply) => {
  const existingUser = await User.findOne({ _id: userId });
  if (!existingUser) {
    throw new AppError(404, "user not found");
  }

  const existingComment = await Comment.findOne({ _id: payload.commentId });
  if (!existingComment) {
    throw new AppError(404, "comment not found");
  }

  const reply = await Reply.create({
    userId,
    commentId: payload.commentId,
    message: payload.message,
  });

  return reply;
};

export const postServices = {
  createPostIntoDB,
  getAllPostsFromDB,
  handleLikeUnlikePostIntoDB,
  createCommentIntoDB,
  createReplyIntoDB,
  deletePostFromDB,
  getPostDetailsFromDB,
};
