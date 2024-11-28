const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Hospital = require("./hospitalModel");
const Doctor = require("./doctorModel");

const DoctorSchedule = sequelize.define(
  "DoctorSchedule",
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
    date_of_week: {
      type: DataTypes.STRING,
    },
    shift_type: {
      type: DataTypes.STRING,
    },
    date: {
      type: DataTypes.DATE,
    },
    start_time: {
      type: DataTypes.TIME,
    },
    end_time: {
      type: DataTypes.TIME,
    },
    slot_duration: {
      type: DataTypes.INTEGER,
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
  {
    timestamps: true,
    tableName: "DoctorSchedules",
  }
);

module.exports = DoctorSchedule;
