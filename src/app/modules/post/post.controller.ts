import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { postServices } from "./post.service";

const createPost = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const payload = req.body;
  await postServices.createPostIntoDB(userId, payload);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Post submitted successfully",
   
  });
});
const allPosts = catchAsync(async (req, res) => {
  const serviceId = req.query.serviceId as string;
  const search = req.query.search as string;
  const level = req.query.level as string;

  const posts = await postServices.getAllPostsFromDB(serviceId, search, level);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "All posts retrieved successfully",
    data: posts,
  });
});
const postDetails = catchAsync(async (req, res) => {
  const id = req.params.id;

  const post = await postServices.getPostDetailsFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Post retrieved successfully",
    data: post,
  });
});
const likeUnlikePost = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.id;

  const post = await postServices.handleLikeUnlikePostIntoDB(userId, postId);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: `${post.message}`,
  });
});

const createComment = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const payload = req.body;
  await postServices.createCommentIntoDB(userId, payload);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Comment submitted successfully",
  });
});
const createReply = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const payload = req.body;
  await postServices.createReplyIntoDB(userId, payload);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Reply submitted successfully",
  });
});

export const postController = {
  createPost,
  allPosts,
  postDetails,
  likeUnlikePost,
  createComment,
  createReply,
};
