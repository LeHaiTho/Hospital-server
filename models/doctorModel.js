const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./userModel");

const Doctor = sequelize.define(
  "Doctor",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    certificate_id: {
      type: DataTypes.STRING,
    },
    summary: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
  },
  { timestamps: true, tableName: "Doctors" }
);
module.exports = Doctor;
