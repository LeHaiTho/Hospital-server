// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");
// const Doctor = require("./doctorModel");
// const Hospital = require("./hospitalModel");

// const WorkingShifts = sequelize.define(
//   "WorkingShifts",
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     doctor_id: {
//       type: DataTypes.INTEGER,
//       references: {
//         model: Doctor,
//         key: "id",
//       },
//     },
//     hospital_id: {
//       type: DataTypes.INTEGER,
//       references: {
//         model: Hospital,
//         key: "id",
//       },
//     },
//     day_of_week: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     start_time: {
//       type: DataTypes.TIME,
//       allowNull: false,
//     },
//     end_time: {
//       type: DataTypes.TIME,
//       allowNull: false,
//     },
//     start_date: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//     end_date: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//     visibility: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: true,
//     },
//   },
//   {
//     tableName: "WorkingShifts",
//     timestamps: true,
//   }
// );

// // WorkingShifts.belongsTo(Doctor, {
// //   foreignKey: "doctor_id",
// //   as: "doctor",
// // });

// // WorkingShifts.belongsTo(Hospital, {
// //   foreignKey: "hospital_id",
// //   as: "hospital",
// // });

// module.exports = WorkingShifts;
