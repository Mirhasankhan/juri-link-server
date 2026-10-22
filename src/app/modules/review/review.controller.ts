import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { reviewServices } from "./review.service";

const createReview = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const payload = req.body;
  await reviewServices.createReviewIntoDB(userId, payload);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Review submitted successfully",
  });
});
const createReport = catchAsync(async (req, res) => {
  await reviewServices.createReportIntoDB(req);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Report submitted successfully",
  });
});

export const reviewController = {
  createReview,
  createReport
};
