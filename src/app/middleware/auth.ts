import { NextFunction, Request, Response } from "express";
import { Secret } from "jsonwebtoken";
import httpStatus from "http-status";
import config from "../config";
import { jwtHelpers } from "../utils/jwtHelpers";
import AppError from "../utils/AppError";

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.jwt_secret as Secret
      );

      req.user = verifiedUser;

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "Forbidden! You are not authorized"
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
