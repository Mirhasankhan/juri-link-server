import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { reviewServices } from "./review.service";

const createReview = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const payload = req.body;
  const review = await reviewServices.createReviewIntoDB(userId, payload);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Review submitted successfully",
    data: review,
  });
});

export const reviewController = {
  createReview
}