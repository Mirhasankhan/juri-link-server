import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TPKey } from "./terms.policy.model";
import { termsPrivacyService } from "./terms.policy.service";

const termsAndPrivacy = catchAsync(async (req, res) => {
  const payload = req.body;
  await termsPrivacyService.createTermsAndPrivacy(payload);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: `${payload.key} updated successfully`,
  });
});
const getTermsAndPolicy = catchAsync(async (req, res) => {
  const key = req.query.key;
  const result = await termsPrivacyService.getTermsAndPolicyFromDB(
    key as TPKey
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `${key} retrieved successfully`,
    data: result,
  });
});

export const termsPrivacyController = {
  termsAndPrivacy,
  getTermsAndPolicy,
};
