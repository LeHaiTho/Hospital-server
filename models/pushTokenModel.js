const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./userModel");

const PushToken = sequelize.define(
  "PushToken",
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
    pushToken: {
      type: DataTypes.STRING(255),
    },
  },
  {
    timestamps: true,
    tableName: "PushTokens",
  }
);

module.exports = PushToken;
