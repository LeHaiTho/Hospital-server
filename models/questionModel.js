const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./userModel");
const Specialty = require("./specialtyModel");
const Question = sequelize.define(
  "Question",
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
    specialty_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Specialty,
        key: "id",
      },
    },
    content: {
      type: DataTypes.TEXT,
    },
    image: {
      type: DataTypes.STRING,
    },
    is_anonymous: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    timestamps: true,
    tableName: "Questions",
  }
);
module.exports = Question;
