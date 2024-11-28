"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Xoá cột gender cũ
    await queryInterface.removeColumn("FamilyMembers", "gender");

    // Thêm lại cột gender với kiểu BOOLEAN
    await queryInterface.addColumn("FamilyMembers", "gender", {
      type: Sequelize.BOOLEAN,
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
