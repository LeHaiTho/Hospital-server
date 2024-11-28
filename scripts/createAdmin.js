require("dotenv").config({ path: "../.env" });
const bcrypt = require("bcrypt");
const sequelize = require("../config/database");

const User = require("../models/userModel");
const Role = require("../models/roleModel");
const createAdmin = async (req, res) => {
  try {
    await sequelize.sync({ alerts: true });

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    let adminRole = await Role.findOne({ where: { name: "admin" } });
    if (!adminRole) {
      adminRole = await Role.create({ name: "admin" });
    }

    let admin = await User.findOne({
      where: { email: "adhospitallht@gmail.com" },
    });
    if (!admin) {
      admin = await User.create({
        username: "admin",
        password: hashedPassword,
        email: "adhospitallht@gmail.com",
        role_id: adminRole.id,
        status: true,
      });
      console.log("Admin created successfully");
    }
  } catch (err) {
    console.error("Error syncing database:", err);
  }
};
createAdmin();
