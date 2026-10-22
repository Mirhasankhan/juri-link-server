import { NextFunction, Request, Response } from "express";
import { Secret } from "jsonwebtoken";
import httpStatus from "http-status";
import config from "../config";
import { jwtHelpers } from "../utils/jwtHelpers";
import AppError from "../utils/AppError";

import { TJwtPayload } from "../interface";

const auth = (...roles: string[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let token = req.headers.authorization;

      if (!token || token === "null" || token === "undefined") {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      if (token.startsWith("Bearer ")) {
        token = token.slice(7).trim();
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.jwt_secret as Secret
      ) as TJwtPayload;

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
