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
const createAdmin = catchAsync(async (req, res) => {
  const payload = req.body;
  await adminServices.createNewAdminIntoDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Admin created successfully",
  });
});

export const adminController = {
  createAdmin,
  adminLogin,
};
