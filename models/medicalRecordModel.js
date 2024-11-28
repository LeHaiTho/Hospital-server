const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Hospital = require("./hospitalModel");
const Appointment = require("./appointmentModel");
const User = require("./userModel");
const Doctor = require("./doctorModel");
const DoctorSchedule = require("./doctorScheduleModel");
const TimeSlot = require("./timeSlotModel");

const MedicalRecord = sequelize.define(
  "MedicalRecord",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    hospital_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Hospital,
        key: "id",
      },
    },
    appointment_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Appointment,
        key: "id",
      },
    },

    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Doctor,
        key: "id",
      },
    },
    reason_for_visit: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    diagnosis: {
      type: DataTypes.TEXT,
    },
    treatment: {
      type: DataTypes.TEXT,
    },
    diagnostic_files: {
      type: DataTypes.JSONB,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { timestamps: true, tableName: "MedicalRecord" }
);

module.exports = MedicalRecord;
