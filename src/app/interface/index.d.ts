/* eslint-disable @typescript-eslint/no-namespace */
import { JwtPayload } from "jsonwebtoken";

export interface TJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
  fullName?: string;
  adminName?: string;
}

declare global {
  namespace Express {
    interface Request {
      user: TJwtPayload;
    }
  }
}