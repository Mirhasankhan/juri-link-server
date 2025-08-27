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

export const bookingController = {
    createBooking
}
