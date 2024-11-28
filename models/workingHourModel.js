// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");
// const Hospital = require("./hospitalModel");
// const WorkingHour = sequelize.define(
//   "WorkingHour",
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     hospital_id: {
//       type: DataTypes.INTEGER,
//       references: {
//         model: Hospital,
//         key: "id",
//       },
//     },
//     morning_start: {
//       type: DataTypes.TIME,
//     },
//     morning_end: {
//       type: DataTypes.TIME,
//     },
//     afternoon_start: {
//       type: DataTypes.TIME,
//     },
//     afternoon_end: {
//       type: DataTypes.TIME,
//     },
//   },
//   {
//     tableName: "WorkingHours",
//     timestamps: true,
//   }
// );

// module.exports = WorkingHour;
