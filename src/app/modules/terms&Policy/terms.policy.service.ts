import { TermsAndPrivacy, TPKey } from "./terms.policy.model";

const createTermsAndPrivacy = async (data: any) => {
  await TermsAndPrivacy.findOneAndUpdate(
    { key: data.key },
    {
      $set: {
        content: data.content,
      },
      $setOnInsert: {
        key: data.key,
      },
    },
    {
      upsert: true,
      new: true,
    }
  );

  return;
};
const getTermsAndPolicyFromDB = async (key: TPKey) => {
  const result = await TermsAndPrivacy.find(
    { key },
    {
      _id: 1,
      content: 1,
      key: 1,
    }
  ).lean();

  return result;
};

export const termsPrivacyService = {
  createTermsAndPrivacy,
  getTermsAndPolicyFromDB
};
