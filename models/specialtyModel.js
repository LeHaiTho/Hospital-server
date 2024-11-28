const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Specialty = sequelize.define(
  "Specialty",
  {
    name: {
      type: DataTypes.STRING,
    },
    photo: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    slug: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
    tableName: "Specialties",
  }
);

module.exports = Specialty;
