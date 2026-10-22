import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { legalServices } from "./legal.service";

const createLegalService = catchAsync(async (req, res) => {
  const service = await legalServices.createLegalServiceIntoDB(req);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Legal service created successfully",
    data: service,
  });
});
const getLegalServices = catchAsync(async (req, res) => {
  const legalService = await legalServices.getAllLegalServicesFromDB();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Legal services retrieved successfully",
    data: legalService,
  });
});
const getSingleService = catchAsync(async (req, res) => {
  const service = await legalServices.getSingleLegalServiceFromDB(
    req.params.id
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Legal service retrieved successfully",
    data: service,
  });
});

export const legalServiceController = {
  createLegalService,
  getLegalServices,
  getSingleService,
};
