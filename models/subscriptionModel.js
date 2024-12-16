const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./userModel");
const Package = require("./packageModel");
const Doctor = require("./doctorModel");
const Subscription = sequelize.define(
  "Subscription",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "Doctors",
        key: "id",
      },
    },
    package_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "packages",
        key: "id",
      },
    },
    start_date: {
      type: DataTypes.DATE,
    },
    end_date: {
      type: DataTypes.DATE,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    tableName: "subscriptions",
  }
);

module.exports = Subscription;
