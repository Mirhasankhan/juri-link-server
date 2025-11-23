import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { adminServices } from "./admin.service";

const adminLogin = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await adminServices.loginAdminFromDB(email, password);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Admin loggedin successfully",
    data: result,
  });
});

export const adminController = {
  adminLogin,
};
