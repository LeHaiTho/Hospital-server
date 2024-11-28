const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Prescription = require("./prescriptionModel");

const PrescriptionItem = sequelize.define(
  "PrescriptionItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    prescription_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Prescription,
        key: "id",
      },
    },
    medicate_name: {
      type: DataTypes.STRING,
    },
    dosage: {
      type: DataTypes.STRING,
    },
    quantity: {
      type: DataTypes.INTEGER,
    },
    instructions: {
      type: DataTypes.TEXT,
    },
  },
  { timestamps: true, tableName: "PrescriptionItems" }
);

module.exports = PrescriptionItem;
