const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Doctor = require("./doctorModel");
const Hospital = require("./hospitalModel");
const DoctorHospital = sequelize.define(
  "DoctorHospital",
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
    hospital_id: {
      type: DataTypes.INTEGER,
      references: {
        as: "hospital",
        key: "id",
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { timestamps: true, tableName: "DoctorHospital" }
);

module.exports = DoctorHospital;
