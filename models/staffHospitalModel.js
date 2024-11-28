const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./userModel");
const Hospital = require("./hospitalModel");

const StaffHospital = sequelize.define(
  "StaffHospital",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: User,
        key: "id",
      },
    },
    hospital_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Hospital,
        key: "id",
      },
    },
  },
  { timestamps: true, tableName: "StaffHospitals" }
);

module.exports = StaffHospital;
