const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Hospital = require("./hospitalModel");

const HospitalShift = sequelize.define(
  "HospitalShift",
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
        as: "hospital",
      },
    },
    name: {
      type: DataTypes.STRING,
    },
    start_time: {
      type: DataTypes.TIME,
    },
    end_time: {
      type: DataTypes.TIME,
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
  { timestamps: true, tableName: "HospitalShifts" }
);

module.exports = HospitalShift;
