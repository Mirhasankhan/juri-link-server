import { Types } from "mongoose";

export interface IAvailableSlot {
  _id?: string;
  availabilityId: Types.ObjectId | string;
  startTime: string;
  endTime: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAvailability {
  _id?: string;
  lawyerId: Types.ObjectId | string;
  dayOfWeek: number;
  slots: Types.ObjectId[] | IAvailableSlot[];
  createdAt?: Date;
  updatedAt?: Date;
}
