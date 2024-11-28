const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Appointment = require("./appointmentModel");

const ReminderAppointment = sequelize.define(
  "reminder_appointment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    appointment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Appointment,
        key: "id",
      },
    },
    reminder_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "sent", "failed"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  { timestamps: true, tableName: "reminder_appointments" }
);

module.exports = ReminderAppointment;
