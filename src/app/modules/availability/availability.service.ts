import dayjs from "dayjs";
import { AvailabilityModel, AvailableSlotModel } from "./availability.model";
import { isOverlap } from "../../utils/isOverlap";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import customParseFormat from "dayjs/plugin/customParseFormat";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { User } from "../user/user.model";

dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);

function parseSlotToTime(time: string) {
  return dayjs(time, "hh:mm A").format("hh:mm A");
}

const createUserAvailability = async (
  lawyerId: string,
  availability: any[]
) => {
  await AvailabilityModel.deleteMany({ lawyerId });
  await AvailableSlotModel.deleteMany({});

  const created = [];

  for (const day of availability) {
    const availabilityDoc = await AvailabilityModel.create({
      lawyerId,
      dayOfWeek: day.dayOfWeek,
    });

    const slots = await AvailableSlotModel.insertMany(
      day.slots.map((s: any) => ({
        availabilityId: availabilityDoc._id,
        startTime: parseSlotToTime(s.startTime),
        endTime: parseSlotToTime(s.endTime),
      }))
    );

    availabilityDoc.slots = slots.map((s) => s._id);
    await availabilityDoc.save();

    created.push(availabilityDoc);

    await User.updateOne(
      { _id: lawyerId },
      { $set: { availabilitySetup: true } }
    );
  }

  return created;
};

const getExpertDayWiseSlotsFromDB = async (
  lawyerId: string,
  dayOfWeek: number
) => {
  const availabilities = await AvailabilityModel.find({
    lawyerId,
    dayOfWeek,
  }).populate("slots");

  if (!availabilities.length) return [];

  const now = dayjs();
  const today = now.day();
  const diff = (dayOfWeek - today + 7) % 7;
  const targetDate = now.add(diff, "day").startOf("day");

  const result = [];

  for (const a of availabilities) {
    for (const slot of a.slots as any) {
      const start = dayjs(slot.startTime, "hh:mm A");
      const end = dayjs(slot.endTime, "hh:mm A");

      let pointer = targetDate.hour(start.hour()).minute(start.minute());
      const endPoint = targetDate.hour(end.hour()).minute(end.minute());

      while (pointer.isBefore(endPoint)) {
        // const next = pointer.add(30, "minute");
        const next = pointer.add(1, "hour");
        if (next.isAfter(now)) {
          result.push({
            start: pointer.format("hh:mm A"),
            end: next.format("hh:mm A"),
          });
        }
        pointer = next;
      }
    }
  }

  return result;
};

const getExpertsAllSlotsFromDB = async (lawyerId: string) => {
  const availability = await AvailabilityModel.find({ lawyerId })
    .populate("slots")
    .lean();

  return availability.map((a) => ({
    dayOfWeek: a.dayOfWeek,
    slots: a.slots.map((s: any) => ({
      id: s._id,
      availabilityId: a._id,
      startTime: s.startTime,
      endTime: s.endTime,
    })),
  }));
};

const deleteSlotFromDB = async (slotId: string) => {
  const slot = await AvailableSlotModel.findById(slotId).lean();
  if (!slot) return;

  await AvailableSlotModel.deleteOne({ _id: slotId });
  await AvailabilityModel.updateOne(
    { _id: slot.availabilityId },
    { $pull: { slots: slotId } }
  );
};

const updateSlotFromDB = async (slotId: string, data: any) => { 
  const slot = await AvailableSlotModel.findById(slotId);
  if (!slot) throw new Error("Slot not found");

  const availabilityId = slot.availabilityId;
  const allSlots = await AvailableSlotModel.find({ availabilityId });

  for (const existing of allSlots) {
    if (existing._id.toString() === slotId) continue;

    if (
      isOverlap(
        data.startTime,
        data.endTime,
        existing.startTime,
        existing.endTime
      )
    ) {
      throw new Error(
        `Time conflict: overlaps with ${existing.startTime} - ${existing.endTime}`
      );
    }
  }

  return AvailableSlotModel.findByIdAndUpdate(
    slotId,
    {
      startTime: parseSlotToTime(data.startTime),
      endTime: parseSlotToTime(data.endTime),
    },
    { new: true }
  );
};


const addNewSlotIntoDB = async (lawyerId: string, payload: any) => {
  let availability = await AvailabilityModel.findOne({
    lawyerId,
    dayOfWeek: payload.dayOfWeek,
  });

  if (!availability) {
    availability = await AvailabilityModel.create({
      lawyerId,
      dayOfWeek: payload.dayOfWeek,
      slots: [],
    });
  }

  const existingSlots = await AvailableSlotModel.find({
    availabilityId: availability._id,
  });

  for (const slot of existingSlots) {
    if (
      isOverlap(
        payload.startTime,
        payload.endTime,
        slot.startTime,
        slot.endTime
      )
    ) {
      throw new Error(
        `Time conflict: overlaps with existing slot ${slot.startTime} - ${slot.endTime}`
      );
    }
  }

  const newSlot = await AvailableSlotModel.create({
    availabilityId: availability._id,
    startTime: parseSlotToTime(payload.startTime),
    endTime: parseSlotToTime(payload.endTime),
  });

  (availability.slots as any[]).push(newSlot._id);

  // availability.slots.push(newSlot._id);
  await availability.save();

  return newSlot;
};

export const availabilityServices = {
  createUserAvailability,
  addNewSlotIntoDB,
  getExpertDayWiseSlotsFromDB,
  updateSlotFromDB,
  deleteSlotFromDB,
  getExpertsAllSlotsFromDB,
};
