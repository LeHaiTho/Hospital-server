const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Appointment = require("./appointmentModel");

const HealthCheckInfo = sequelize.define(
  "HealthCheckInfo",
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
    weight: {
      type: DataTypes.FLOAT,
    },
    height: {
      type: DataTypes.FLOAT,
    },
    heart_rate: {
      type: DataTypes.FLOAT,
    },
    blood_pressure: {
      type: DataTypes.STRING,
    },
  },
  { timestamps: true, tableName: "HealthCheckInfos" }
);

module.exports = HealthCheckInfo;
