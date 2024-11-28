const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./userModel");
const Question = require("./questionModel");
const Comment = sequelize.define(
  "Comment",
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
    question_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Question,
        key: "id",
      },
    },
    content: {
      type: DataTypes.TEXT,
    },
  },
  {
    timestamps: true,
    tableName: "Comments",
  }
);

module.exports = Comment;
