'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Task.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    userId: {type: DataTypes.INTEGER, references:{model:"Users",key:"id"}},
    priority:{type:DataTypes.STRING},
    status:{type:DataTypes.STRING},
    dueDate:{type:DataTypes.DATEONLY}

  }, {
    sequelize,
    modelName: 'Task',
  });
  return Task;
};