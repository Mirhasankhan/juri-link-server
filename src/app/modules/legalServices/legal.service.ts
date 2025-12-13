import { Request } from "express";
import { IUploadFile } from "../../interface/file";
import { FileUploadHelper } from "../../helpers/filUploadHelper";
import { LegalService } from "./legalService.model";
import AppError from "../../utils/AppError";
import { User } from "../user/user.model";

const createLegalServiceIntoDB = async (req: Request) => {
  const payload = req.body;
 

  const existingService = await LegalService.findOne({
    serviceName: { $regex: `^${payload.serviceName.trim()}$`, $options: "i" },
  });
  if (existingService) {
    throw new AppError(409, "Legal service already exists");
  }

  const files = req.files as IUploadFile[] | undefined;

  if (files && files.length > 0) {
    const uploadedMedia = await FileUploadHelper.uploadToCloudinary(files);
    payload.serviceMedia = uploadedMedia[0].secure_url;
  }

  if (!payload.serviceMedia) {
    throw new AppError(404, "Service image required");
  }

  const legalService = await LegalService.create(payload);

  return legalService;
};

const getAllLegalServicesFromDB = async () => {
  const legalServices = await LegalService.find().lean();
  return legalServices;
};

const getSingleLegalServiceFromDB = async (serviceId: string) => {
  const existingService = await LegalService.findById(serviceId).lean();
  if (!existingService) {
    throw new AppError(404, "Service not found!");
  }

  const usersWithSpecialization = await User.find({
    specialization: serviceId,
  })
    .select("fullName email profileImage experience serviceType specialization")
    .lean();

  return {
    service: existingService,
    users: usersWithSpecialization,
  };
};

export const legalServices = {
  createLegalServiceIntoDB,
  getAllLegalServicesFromDB,
  getSingleLegalServiceFromDB,
};
