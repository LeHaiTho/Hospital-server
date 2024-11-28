const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Appointment = require("./appointmentModel");

const ImagingDiagnostic = sequelize.define(
  "ImagingDiagnostic",
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
    description: {
      type: DataTypes.STRING,
    },
    file_url: {
      type: DataTypes.STRING,
    },
    file_type: {
      type: DataTypes.STRING,
    },
  },
  { timestamps: true, tableName: "ImagingDiagnostics" }
);

module.exports = ImagingDiagnostic;
