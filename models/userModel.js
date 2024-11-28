const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Role = require("../models/roleModel");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    identity_card: {
      type: DataTypes.STRING,
      unique: true,
    },
    fullname: {
      type: DataTypes.STRING,
    },
    username: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    role_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Role,
        key: "id",
      },
    },
    avatar: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    },
    gender: {
      type: DataTypes.BOOLEAN,
    },
    date_of_birth: {
      type: DataTypes.DATE,
    },
    province: {
      type: DataTypes.STRING,
    },
    district: {
      type: DataTypes.STRING,
    },
    ward: {
      type: DataTypes.STRING,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    activationToken: {
      type: DataTypes.STRING,
    },
    isActivated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isFirstLogin: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  { timestamps: true, tableName: "Users" }
);

module.exports = User;
