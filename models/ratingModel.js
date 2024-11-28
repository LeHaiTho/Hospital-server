const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./userModel");
const Hospital = require("./hospitalModel");
const Doctor = require("./doctorModel");
const Appointment = require("./appointmentModel");

const Rating = sequelize.define(
  "Rating",
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
    doctor_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Doctor,
        key: "id",
      },
    },
    patient_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
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
    rating: {
      type: DataTypes.INTEGER,
    },
    comment: {
      type: DataTypes.TEXT,
    },
  },
  {
    timestamps: true,
    tableName: "Ratings",
  }
);

module.exports = Rating;
