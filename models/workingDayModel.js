const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Hospital = require("./hospitalModel");

const WorkingDay = sequelize.define(
  "WorkingDay",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date_of_week: {
      type: DataTypes.STRING,
    },
    hospital_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Hospital,
        key: "id",
      },
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "working_days",
  }
);

module.exports = WorkingDay;
