const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const WorkingDay = require("./workingDayModel");

const TimeSlot = sequelize.define(
  "TimeSlot",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    working_day_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: WorkingDay,
        key: "id",
      },
    },
    // vừa thêm để test ca làm việc
    shift_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    tableName: "time_slots",
  }
);

module.exports = TimeSlot;
