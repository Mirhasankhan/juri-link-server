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

export const postServices = {
  createPostIntoDB,
};
