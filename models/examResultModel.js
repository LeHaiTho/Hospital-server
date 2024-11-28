const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Appointment = require("./appointmentModel");

const ExamResult = sequelize.define(
  "ExamResult",
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
      type: DataTypes.TEXT,
    },
    findings: {
      type: DataTypes.TEXT,
    },
    recommendation: {
      type: DataTypes.TEXT,
    },
  },
  { timestamps: true, tableName: "ExamResults" }
);

module.exports = ExamResult;
