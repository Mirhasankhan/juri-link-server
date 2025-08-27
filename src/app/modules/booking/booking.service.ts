import { User } from "../user/user.model";
import { Booking, TBooking } from "./booking.model";

const createBookingIntoDb = async (userId: string, payload: TBooking) => {
  const existingUser = await User.findById(userId);
  if (!existingUser) {
    throw new Error("User not found");
  }
  const existingLawyer = await User.findById(payload.lawyerId);
  if (!existingLawyer) {
    throw new Error("Lawyer not found");
  }
  
 const serviceExists = existingLawyer.specialization.some(
    (service: string) => service.toString() === payload.serviceId.toString()
  );

  if (!serviceExists) {
    throw new Error("This lawyer does not provide the selected service");
  }

  const newBooking = await Booking.create({
    ...payload,
    userId,
  });

  return newBooking;
};

export const bookingServices = {
    createBookingIntoDb
}
