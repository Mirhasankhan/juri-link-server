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


export const postController = {
    createPost
}
