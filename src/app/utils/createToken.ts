import jwt, { SignOptions } from "jsonwebtoken";

interface Payload {
  [key: string]: any;
}

const createJSONWebToken = (
  payload: Payload,
  secretKey: string,
  expiresIn: string | number
): string | undefined => {
  if (typeof payload !== "object" || !payload) {
    throw new Error("Payload must be a non-empty object");
  }
  if (typeof secretKey !== "string" || secretKey === "") {
    throw new Error("Secret key must be a non-empty string");
  }

  try {
    const options: SignOptions = { expiresIn };
    const token = jwt.sign(payload, secretKey, options);
    return token;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export { createJSONWebToken };
