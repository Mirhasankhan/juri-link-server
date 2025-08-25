import AppError from "../../utils/AppError";
import { User } from "../user/user.model";
import { Post, TPost } from "./post.model";

const createPostIntoDB = async (userId: string, payload: TPost) => {
  const existingUser = await User.findOne({ _id: userId });
  if (!existingUser) {
    throw new AppError(404, "user not found");
  }
  const post = await Post.create({
    ...payload,
    userId,
  });

  return post;
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

  const posts = await Post.find(filter).populate("userId", "fullName profileImage");
  return posts;
};


export const postServices = {
  createPostIntoDB,
  getAllPostsFromDB,
};
