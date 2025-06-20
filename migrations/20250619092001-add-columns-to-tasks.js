'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tasks', 'priority', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Tasks', 'status', {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('Tasks','dueDate',{
      type:Sequelize.DATEONLY
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Tasks', 'priority');
    await queryInterface.removeColumn('Tasks', 'status');
    await queryInterface.removeColumn('Tasks','dueDate');
  }
};
