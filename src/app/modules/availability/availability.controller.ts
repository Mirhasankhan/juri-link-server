import { Request, Response } from "express";

import { availabilityServices } from "./availability.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

const createAvailability = catchAsync(async (req: Request, res: Response) => {
  const lawyerId = req.user.id;
  const { availability } = req.body;
  await availabilityServices.createUserAvailability(lawyerId, availability);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Availability created successfully",
  });
});

const getExpertDayWiseSlots = catchAsync(
  async (req: Request, res: Response) => {
    const lawyerId = req.query.lawyerId as string;
    const day = parseInt(req.query.day as string);

    const result = await availabilityServices.getExpertDayWiseSlotsFromDB(
      lawyerId,
      day
    );
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Slots retrieved successfully",
      data: result,
    });
  }
);
const expertAllSlots = catchAsync(async (req: Request, res: Response) => {
  const lawyerId = req.user.id;
  const result = await availabilityServices.getExpertsAllSlotsFromDB(lawyerId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Slots retrieved successfully",
    data: result,
  });
});
const addNewSlot = catchAsync(async (req: Request, res: Response) => {
  const lawyerId = req.user.id;
  const { slot } = req.body;

  await availabilityServices.addNewSlotIntoDB(lawyerId, slot);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Slot created successfully",
  });
});
const updateSlot = catchAsync(async (req: Request, res: Response) => {
  const { slotId, slot } = req.body;

  const result = await availabilityServices.updateSlotFromDB(slotId, slot);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Slot updated successfully",
    data: result,
  });
});
const deleteSlot = catchAsync(async (req: Request, res: Response) => {
  const slotId = req.params.id;
  await availabilityServices.deleteSlotFromDB(slotId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Slot deleted successfully",
  });
});

export const availabilityController = {
  createAvailability,  
  updateSlot,
  expertAllSlots,
  addNewSlot,
  deleteSlot,
  getExpertDayWiseSlots,
};
