const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./userModel");
const Doctor = require("./doctorModel");
const Hospital = require("./hospitalModel");
const DoctorSchedule = require("./doctorScheduleModel");
const Specialty = require("./specialtyModel");
const AppointmentSlot = require("./appointmentSlotModel");
const FamilyMember = require("./familyMemberModel");
const { Hooks } = require("sequelize/lib/hooks");
const Appointment = sequelize.define(
  "Appointment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    appointment_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    familyMember_id: {
      type: DataTypes.INTEGER,
      references: {
        model: FamilyMember,
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
    staff_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
        role_id: 4,
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
    appointmentSlot_id: {
      type: DataTypes.INTEGER,
      references: {
        model: AppointmentSlot,
        key: "id",
      },
    },
    specialty_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Specialty,
        key: "id",
      },
    },
    reason_for_visit: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    appointment_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    appointment_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM,
      values: [
        "pending",
        "confirmed",
        "rejected",
        "cancelled",
        "completed",
        "updated",
        "waiting",
      ],
      defaultValue: "pending",
    },
    payment_status: {
      type: DataTypes.ENUM,
      values: ["pending", "paid", "failed"],
      defaultValue: "pending",
    },
    payment_method: {
      type: DataTypes.ENUM,
      values: ["cash", "credit_card", "bank_transfer", "e-wallet"],
      defaultValue: "cash",
    },
    // ngày đến khám
    appointment_date_of_visit: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // thời gian đến khám
    appointment_time_of_visit: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isDoctorSpecial: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    original_appointment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },

  { timestamps: true, tableName: "Appointments" }
);

module.exports = Appointment;
