const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./userModel");
const ChatRoom = require("./chatRoomModel");

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    room_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: ChatRoom,
        key: "room_id",
      },
    },
    sender_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
    },
    content: {
      type: DataTypes.TEXT,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    read_at: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: true,
    tableName: "messages",
  }
);

module.exports = Message;
