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
const getCleanSearch = (search: any): string | undefined => {
  if (!search || search === "undefined" || search === "null") return undefined;
  return String(search).trim() || undefined;
};

const allUsers = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const search = getCleanSearch(req.query.search);
  const result = await adminServices.getAllUsersFromDB(page, search);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Users retrieved successfully",
    data: result,
  });
});
const allLawyers = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const search = getCleanSearch(req.query.search);
  const result = await adminServices.getAllLawyersFromDB(page, search);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Lawyers retrieved successfully",
    data: result,
  });
});
const allAdmins = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const search = getCleanSearch(req.query.search);
  const role = req.query.role as TAdminRole;
  const result = await adminServices.getAllAdminsFromDB(page, search, role);

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
  const page = parseInt(req.query.page as string) || 1;
  const status = req.query.status;
  const result = await adminServices.getAllWithdrawRequestsFromDB(
    page,
    status as string,
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
  const page = parseInt(req.query.page as string) || 1;
  const status = req.query.status;
  const result = await adminServices.getAllReportsFromDB(
    page,
    status as string,
  );

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
const dashboardOverview = catchAsync(async (req, res) => {
  const result = await adminServices.getDashboardOverviewFromDB();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Overview retrieved successfully",
    data: result,
  });
});
const blockUnblockUser = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const result = await adminServices.blockUnblockUserFromDB(userId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `${result.message}`,
  });
});

const getAdminProfile = catchAsync(async (req, res) => {
  const adminId = req.user.id;
  const result = await adminServices.getAdminProfileFromDB(adminId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Admin profile retrieved successfully",
    data: result,
  });
});

const adminEarnings = catchAsync(async (req, res) => {
  const result = await adminServices.getAdminEarningsFromDB();

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Admin earnings retrieved successfully",
    data: result,
    result,
  });
});

export const adminController = {
  createAdmin,
  allReports,
  adminLogin,
  acceptWithdrawRequest,
  deleteAdmin,
  dashboardOverview,
  allUsers,
  allLawyers,
  allAdmins,
  withdrawRequests,
  responseToReport,
  blockUnblockUser,
  getAdminProfile,
  adminEarnings,
};
