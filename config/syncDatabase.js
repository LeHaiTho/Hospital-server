const sequelize = require("./database");
const {
  Doctor,
  DoctorSpecialty,
  Hospital,
  HospitalSpecialty,
  Role,
  Specialty,
  WorkingShifts,
} = require("../models/index");

// Sync all models with the database
const syncDatabase = async () => {
  try {
    await sequelize.sync();
    console.log("Syncing database");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};
module.exports = syncDatabase;
