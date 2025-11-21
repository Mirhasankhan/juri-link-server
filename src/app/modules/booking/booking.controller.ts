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
const lawyerWiseBookings = catchAsync(async (req, res) => {
  const lawyerId = req.user.id;
  const bookings = await bookingServices.getLawyerWiseBookingsFromDB(lawyerId);
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
const cancelBooking = catchAsync(async (req, res) => {
  const payload = req.body

  await bookingServices.cancelBookingFromDB(payload);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Booking cancelled and fee refunded",
  });
});
const refundRequest = catchAsync(async (req, res) => {
  const payload = req.body

  await bookingServices.sendRefundRequestIntoDB(payload);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Refund request send to admin",
  });
});

export const bookingController = {
  createBooking,
  markCompleted,
  userWiseBookings,
  cancelBooking,
  refundRequest,
  lawyerWiseBookings
};
