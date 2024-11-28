const { DataTypes } = require("sequelize");
const Appointment = require("./appointmentModel");
const sequelize = require("../config/database");

const Prescription = sequelize.define(
  "Prescription",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    appointment_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Appointment,
        key: "id",
      },
    },
  },
  { timestamps: true, tableName: "Prescriptions" }
);

module.exports = Prescription;
