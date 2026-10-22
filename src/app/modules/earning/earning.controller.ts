import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { earningServices } from "./earning.service";

const lawerysEarningsSummary = catchAsync(async (req, res) => {
  const lawyerId = req.user.id;
  const type = (req.query.type as "weekly") || "monthly";
  const result = await earningServices.getLawyerEarningSummaryFromDB(
    lawyerId,
    type
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Earning summary retrieved successfully",
    data: result,
  });
});

const createWitdrawRequest = catchAsync(async (req, res) => {
  const lawyerId = req.user.id;
  const amount = req.body.amount;
  await earningServices.createWithdrawRequestIntoDB(lawyerId, amount);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Withdraw request submitted successfully",
  });
});
const withdrawHistory = catchAsync(async (req, res) => {
  const lawyerId = req.user.id;

  const result = await earningServices.getLawyerWiseWithdrawHistory(lawyerId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Withdraw history retrieved successfully",
    data: result,
  });
});

export const earningController = {
  createWitdrawRequest,
  withdrawHistory,
  lawerysEarningsSummary,
};
