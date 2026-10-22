import { Schema, model } from "mongoose";
import { IAvailability, IAvailableSlot } from "./availability.interface";

const availableSlotSchema = new Schema<IAvailableSlot>(
  {
    availabilityId: {
      type: Schema.Types.ObjectId,
      ref: "Availability",
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { timestamps: true }
);

export const AvailableSlotModel = model<IAvailableSlot>(
  "AvailableSlot",
  availableSlotSchema
);

const availabilitySchema = new Schema<IAvailability>(
  {
    lawyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dayOfWeek: { type: Number, required: true },
    slots: [{ type: Schema.Types.ObjectId, ref: "AvailableSlot" }],
  },
  { timestamps: true }
);

export const AvailabilityModel = model<IAvailability>(
  "Availability",
  availabilitySchema
);
