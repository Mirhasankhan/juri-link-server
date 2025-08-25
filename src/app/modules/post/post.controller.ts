import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { postServices } from "./post.service";

const createPost = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const payload = req.body;
  const service = await postServices.createPostIntoDB(userId, payload);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Post successfully",
    data: service,
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

export const postController = {
  createPost,
  allPosts,
};
