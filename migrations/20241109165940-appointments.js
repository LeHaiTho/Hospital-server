"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Appointments", "isDoctorSpecial", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_Appointments_status" ADD VALUE 'updated';`
    );
    // Thêm giá trị 'waiting'
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_Appointments_status" ADD VALUE 'waiting';`
    );
    await queryInterface.addColumn("Appointments", "original_appointment_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
