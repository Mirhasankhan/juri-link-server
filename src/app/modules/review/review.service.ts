import mongoose from "mongoose";
import AppError from "../../utils/AppError";
import { Booking } from "../booking/booking.model";
import { User } from "../user/user.model";
import { Report, Review, TReport, TReview } from "./review.model";
import { Request } from "express";
import { IUploadFile } from "../../interface/file";
import { FileUploadHelper } from "../../helpers/filUploadHelper";

const createReviewIntoDB = async (userId: string, payload: TReview) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser = await User.findById(userId).session(session);
    if (!existingUser) {
      throw new AppError(404, "User not found");
    }

    const existingBooking = await Booking.findById(payload.bookingId).session(
      session
    );
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
          bookingId: payload.bookingId,
        },
      ],
      { session }
    );

    const lawyerBookings = await Booking.find({ lawyerId })
      .select("_id")
      .session(session);
    const bookingIds = lawyerBookings.map((b) => b._id);

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
    await Booking.findByIdAndUpdate(
      payload.bookingId,
      {
        isReviewed: true,
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

const createReportIntoDB = async (req: Request) => {
  const payload = req.body;

  const booking = await Booking.findOne({
    _id: payload.bookingId,
    status: "Completed",
    isReported: false,
  });

  if (!booking) {
    throw new AppError(404, "Booking is not eligible for reporting.");
  }

  let media = "";

  const files = req.files as IUploadFile[] | undefined;

  if (files && files.length > 0) {
    const uploadedMedia = await FileUploadHelper.uploadToCloudinary(files);
    media = uploadedMedia[0].secure_url;
  }

  await Report.create({
    bookingId: payload.bookingId,
    comment: payload.comment,
    reportType: payload.reportType,
    media,
  });

  await Booking.updateOne(
    { _id: payload.bookingId },
    { $set: { isReported: true } }
  );

  return;
};

export const reviewServices = {
  createReviewIntoDB,
  createReportIntoDB
};
