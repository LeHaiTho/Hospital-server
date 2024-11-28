const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Doctor = require("./doctorModel");
const HospitalSpecialty = require("./hospitalSpecialtyModel");

const DoctorSpecialty = sequelize.define(
  "DoctorSpecialty",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Doctor,
        key: "id",
      },
    },
    hospital_specialty_id: {
      type: DataTypes.INTEGER,
      references: {
        model: HospitalSpecialty,
        key: "id",
      },
    },
    consultation_fee: {
      type: DataTypes.DECIMAL(10, 2),
    },
  },
  {
    tableName: "DoctorSpecialties",
    timestamps: true,
  }
);

// DoctorSpecialty.belongsTo(Doctor, {
//   foreignKey: "doctor_id",
//   as: "doctor",
// });
// DoctorSpecialty.belongsTo(HospitalSpecialty, {
//   foreignKey: "hospital_specialty_id",
//   as: "hospitalSpecialty",
// });

module.exports = DoctorSpecialty;
