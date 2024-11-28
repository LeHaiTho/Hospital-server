"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Hospitals", "latitude", {
      type: Sequelize.DECIMAL(10, 8),
    });
    await queryInterface.addColumn("Hospitals", "longitude", {
      type: Sequelize.DECIMAL(11, 8),
    });
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Hospitals", "latitude");
    await queryInterface.removeColumn("Hospitals", "longitude");
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
