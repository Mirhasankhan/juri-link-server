import { Admin } from "../modules/admin/admin.model";
import bcrypt from "bcrypt";
import config from "./index";

const seedSuperAdmin = async () => {
  try {
    // Check if a super admin already exists
    const isSuperAdminExists = await Admin.findOne({ role: "SuperAdmin" });

    if (!isSuperAdminExists) {
      const hashedPassword = bcrypt.hashSync(config.superAdmin.password, 10);
      await Admin.create({
        adminName: config.superAdmin.adminName,
        password: hashedPassword,
        role: "SuperAdmin",
        email: config.superAdmin.email,
      });
      console.log("🦸 Super Admin created successfully.");
    }
  } catch (error) {
    console.error("Error seeding Super Admin:", error);
  }
};

export default seedSuperAdmin;
