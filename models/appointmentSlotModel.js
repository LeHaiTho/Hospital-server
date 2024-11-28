const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Doctor = require("./doctorModel");
const Hospital = require("./hospitalModel");
const DoctorSchedule = require("./doctorScheduleModel");

const AppointmentSlot = sequelize.define(
  "AppointmentSlot",
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
        model: Hospital,
        key: "id",
      },
    },
    doctorSchedule_id: {
      type: DataTypes.INTEGER,
      references: {
        model: DoctorSchedule,
        key: "id",
      },
    },
    start_time: {
      type: DataTypes.TIME,
    },
    end_time: {
      type: DataTypes.TIME,
    },
    isBooked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { timestamps: true, tableName: "appointment_slots" }
);

module.exports = AppointmentSlot;
