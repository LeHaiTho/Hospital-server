const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Package = sequelize.define(
  "Package",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
    },
    description: {
      type: DataTypes.TEXT,
    },
    duration: {
      type: DataTypes.INTEGER,
    },
  },
  {
    timestamps: true,
    tableName: "packages",
  }
);

module.exports = Package;
