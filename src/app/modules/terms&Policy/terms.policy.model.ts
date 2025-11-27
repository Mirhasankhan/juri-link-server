import { Document, Schema, model } from "mongoose";

export enum TPKey {
  Privacy = "Privacy",
  Terms = "Terms",
}

export interface ITermsAndPrivacy extends Document {
  key: TPKey;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}


const termsSchema = new Schema<ITermsAndPrivacy>(
  {
    key: {
      type: String,
      enum: Object.values(TPKey),
      unique: true,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "terms_and_condition",
  }
);

export const TermsAndPrivacy = model<ITermsAndPrivacy>(
  "TermsAndPrivacy",
  termsSchema
);
