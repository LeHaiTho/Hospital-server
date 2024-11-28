const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./userModel");

const Hospital = sequelize.define(
  "Hospital",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.TEXT,
    },
    email: {
      type: DataTypes.STRING,
    },
    avatar: {
      type: DataTypes.STRING,
    },
    banner: {
      type: DataTypes.STRING,
    },
    manager_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    description: {
      type: DataTypes.TEXT,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8), // lưu trữ giá trị vĩ độ với độ chính xác cao
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8), // lưu trữ giá trị kinh độ với độ chính xác cao
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    morning_start: {
      type: DataTypes.TIME,
    },
    morning_end: {
      type: DataTypes.TIME,
    },
    afternoon_start: {
      type: DataTypes.TIME,
    },
    afternoon_end: {
      type: DataTypes.TIME,
    },
    evening_start: {
      type: DataTypes.TIME,
    },
    evening_end: {
      type: DataTypes.TIME,
    },
  },
  {
    tableName: "Hospitals",
    timestamps: true,
  }
);

module.exports = Hospital;
