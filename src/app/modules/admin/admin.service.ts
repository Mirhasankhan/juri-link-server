import config from "../../config";
import AppError from "../../utils/AppError";
import { jwtHelpers } from "../../utils/jwtHelpers";
import { Admin } from "./admin.model";
import bcrypt from "bcrypt";

const loginAdminFromDB = async (email: string, password: string) => {
  const admin = await Admin.findOne({ email });

  if (!admin) throw new AppError(404, "Admin not found");

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    throw new AppError(401, "Invalid credentials");
  }

  const accessToken = jwtHelpers.generateToken(
    {
      id: admin._id,
      email: admin.email,
      role: admin.role,
      adminName: admin.adminName,
    },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string
  );

  return {
    accessToken,
  };
};

export const adminServices = {
  loginAdminFromDB,
};
