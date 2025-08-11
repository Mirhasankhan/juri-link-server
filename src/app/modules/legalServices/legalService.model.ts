import { Schema, model } from "mongoose";

interface TLegalService {
  serviceName: string;
  overview: string;
  features: string[];
  serviceIcon: string;
}

const LegalServiceSchema = new Schema<TLegalService>(
  {
    serviceName: { type: String, required: true, unique: true },
    overview: { type: String, required: true },
    features: { type: [String], required: true },
    serviceIcon: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const LegalService = model<TLegalService>(
  "LegalService",
  LegalServiceSchema
);
