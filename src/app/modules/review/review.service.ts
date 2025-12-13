import mongoose from "mongoose";
import AppError from "../../utils/AppError";
import { Booking } from "../booking/booking.model";
import { User } from "../user/user.model";
import { Review, TReview } from "./review.model";

const createReviewIntoDB = async (userId: string, payload: TReview) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser = await User.findById(userId).session(session);
    if (!existingUser) {
      throw new AppError(404, "User not found");
    }
   
    const existingBooking = await Booking.findById(payload.bookingId).session(session);
    if (!existingBooking) {
      throw new AppError(404, "Booking not found");
    }

    const lawyerId = existingBooking.lawyerId;

    const review = await Review.create(
      [
        {         
          userId,
          lawyerId,
          comment: payload.comment,
          rating: payload.rating,
          bookingId: payload.bookingId
        },
      ],
      { session }
    );

    const lawyerBookings = await Booking.find({ lawyerId }).select("_id").session(session);
    const bookingIds = lawyerBookings.map(b => b._id);

    const stats = await Review.aggregate([
      { $match: { bookingId: { $in: bookingIds } } },
      {
        $group: {
          _id: null,
          totalReview: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
    ]).session(session);

    await User.findByIdAndUpdate(
      lawyerId,
      {
        totalReview: stats[0]?.totalReview || 0,
        avgRating: stats[0]?.avgRating || 0,
      },
      { session }
    );   
    await session.commitTransaction();
    session.endSession();

    return review[0];
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

export const reviewServices = {
  createReviewIntoDB,
};
