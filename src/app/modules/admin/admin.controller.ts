import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TAdminRole } from "./admin.model";
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
const allUsers = catchAsync(async (req, res) => {
  const search = req.query.search as string;
  const result = await adminServices.getAllUsersFromDB(search);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Users retrieved successfully",
    data: result,
  });
});
const allLawyers = catchAsync(async (req, res) => {
  const search = req.query.search as string;
  const result = await adminServices.getAllLawyersFromDB(search);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Lawyers retrieved successfully",
    data: result,
  });
});
const allAdmins = catchAsync(async (req, res) => {
  const search = req.query.search as string;
  const role = req.query.role as TAdminRole;
  const result = await adminServices.getAllAdminsFromDB(search, role);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Admins retrieved successfully",
    data: result,
  });
});
const deleteAdmin = catchAsync(async (req, res) => {
  const adminId = req.params.id;
  await adminServices.deleteAdminFromDB(adminId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Admin deleted successfully",
  });
});
const withdrawRequests = catchAsync(async (req, res) => {
  const status = req.query.status;
  const result = await adminServices.getAllWithdrawRequestsFromDB(
    status as string
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Withdraw requests retrieved successfully",
    data: result,
  });
});
const acceptWithdrawRequest = catchAsync(async (req, res) => {
  await adminServices.acceptWithdrawRequestFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Withdraw request accepted successfully",
  });
});

const allReports = catchAsync(async (req, res) => {
  const status = req.query.status;
  const result = await adminServices.getAllReportsFromDB(status as string);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Reports Retrieved successfully",
    data: result,
  });
});
const responseToReport = catchAsync(async (req, res) => {
  await adminServices.responseToReportIntoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Report responded successfully",
  });
});

export const adminController = {
  createAdmin,
  allReports,
  adminLogin,
  acceptWithdrawRequest,
  deleteAdmin,
  allUsers,
  allLawyers,
  allAdmins,
  withdrawRequests,
  responseToReport
};
