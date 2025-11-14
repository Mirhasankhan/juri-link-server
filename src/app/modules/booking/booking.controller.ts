import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { bookingServices } from "./booking.service";

const createBooking = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const payload = req.body;
  const booking = await bookingServices.createBookingIntoDb(userId, payload);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Booking submitted successfully",
    data: booking,
  });
});
const userWiseBookings = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const bookings = await bookingServices.getUserWiseBookingsFromDB(userId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Bookings retrieved successfully",
    data: bookings,
  });
});
const markCompleted = catchAsync(async (req, res) => {
  const bookingId = req.params.id;

  await bookingServices.markBookingAsCompletedInDB(bookingId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Booking marked as completed successfully",
  });
});

export const bookingController = {
  createBooking,
  markCompleted,
  userWiseBookings
};
