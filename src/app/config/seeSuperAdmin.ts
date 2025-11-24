import { Admin } from "../modules/admin/admin.model";
import bcrypt from "bcrypt";

const superAdminData = {
  adminName: "Mir Hasan",
  role: "SuperAdmin",
  email: "admin@gmail.com",
  password: "123456",
};

const seedSuperAdmin = async () => {
  try {
    // Check if a super admin already exists
    const isSuperAdminExists = await Admin.findOne({ role: "SuperAdmin" });

     const hashedPassword = bcrypt.hashSync(superAdminData.password, 10);

    // If not, create one
    if (!isSuperAdminExists) {
      await Admin.create({
        adminName: superAdminData.adminName,
        password: hashedPassword,
        role: superAdminData.role,
        email: superAdminData.email,
      });
      console.log("🦸 Super Admin created successfully.");
    } else {
      return;
    }
  } catch (error) {
    console.error("Error seeding Super Admin:", error);
  }
};

export default seedSuperAdmin;
