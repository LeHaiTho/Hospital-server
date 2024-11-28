const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./userModel");

const FamilyMember = sequelize.define(
  "FamilyMember",
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
    avatar: {
      type: DataTypes.STRING,
    },
    fullname: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    relationship: {
      type: DataTypes.ENUM,
      values: [
        "father",
        "mother",
        "brother",
        "sister",
        "friend",
        "husband",
        "wife",
        "child",
        "grandparent",
        "grandchild",
        "other",
      ],
    },
    date_of_birth: {
      type: DataTypes.DATE,
    },
    gender: {
      type: DataTypes.BOOLEAN,
    },
    address: {
      type: DataTypes.STRING,
    },
    province: {
      type: DataTypes.STRING,
    },
    district: {
      type: DataTypes.STRING,
    },
    ward: {
      type: DataTypes.STRING,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { timestamps: true, tableName: "FamilyMembers" }
);

module.exports = FamilyMember;
