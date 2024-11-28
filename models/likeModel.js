const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./userModel");
const Question = require("./questionModel");

const Like = sequelize.define(
  "Like",
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
  },
  {
    timestamps: true,
    tableName: "Likes",
  }
);

module.exports = Like;
