"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Appointments", "staff_id", {
      type: Sequelize.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "SET NULL",
    });
    await queryInterface.addColumn("Appointments", "familyMember_id", {
      type: Sequelize.INTEGER,
      references: {
        model: "FamilyMembers",
        key: "id",
      },
      onDelete: "SET NULL",
    });
    await queryInterface.addColumn("Appointments", "appointment_code", {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
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
