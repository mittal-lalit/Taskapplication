'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
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
  },
  Task.associate = (models) => {
    Task.belongsToMany(models.Tag, {
      through: 'tasktags',
      foreignKey: 'taskId',
      otherKey: 'tagId'
    });
  }
);
  return Task;
};
