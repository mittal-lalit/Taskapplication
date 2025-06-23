'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("Users","role",{
      type:Sequelize.STRING,
      defaultValue: 'user',
      allowNull:true
    });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.removeColumn("Users","role");
  }
};
