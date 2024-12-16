const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./userModel");
const Doctor = require("./doctorModel");

const ChatRoom = sequelize.define(
  "chat_room",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    room_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Doctor,
        key: "id",
      },
    },
  },
  {
    tableName: "chat_room",
    timestamps: true,
  }
);

module.exports = ChatRoom;
