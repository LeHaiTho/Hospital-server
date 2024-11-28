const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Hospital = require("./hospitalModel");
const Specialty = require("./specialtyModel");

const HospitalSpecialty = sequelize.define(
  "HospitalSpecialty",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    hospital_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Hospital,
        key: "id",
      },
      allowNull: false,
    },
    specialty_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Specialty,
        key: "id",
      },
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    image: {
      type: DataTypes.STRING,
    },
    consultation_fee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
  },
  {
    tableName: "HospitalSpecialties",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["hospital_id", "specialty_id"],
      },
    ],
  }
);

// HospitalSpecialty.belongsTo(Hospital, {
//   foreignKey: "hospital_id",
//   as: "hospital",
// });
// HospitalSpecialty.belongsTo(Specialty, {
//   foreignKey: "specialty_id",
//   as: "specialty",
// });

module.exports = HospitalSpecialty;
