const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./userModel");

const Notification = sequelize.define(
  "Notification",
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
    type: {
      type: DataTypes.STRING(50),
    },
    title: {
      type: DataTypes.STRING(100),
    },
    content: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM("unread", "read"),
      defaultValue: "unread",
    },
    template: {
      type: DataTypes.STRING(255),
    },
    data: {
      type: DataTypes.JSON,
    },
    url: {
      type: DataTypes.STRING(255),
    },
    read_at: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: true,
    tableName: "Notifications",
  }
);

module.exports = Notification;
