import { Schema, model } from "mongoose";

interface TLegalService {
  serviceName: string;
  serviceMedia: string;
  importance: string;
  description: string;
  totalBooked: number;
}

const LegalServiceSchema = new Schema<TLegalService>(
  {
    serviceName: { type: String, required: true, unique: true },  
    serviceMedia: { type: String, required: true },
    importance: { type: String, required: true },
    description: { type: String, required: true },
    totalBooked: { type: Number, default: 0 },
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
