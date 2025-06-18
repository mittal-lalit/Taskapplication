'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TaskTag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TaskTag.init({
    taskId: {type:DataTypes.INTEGER, references:{model:"Tasks", key:"id"}},
    tagId: {type:DataTypes.INTEGER, references:{model:"Tags", key:"id"}}
  }, {
    sequelize,
    modelName: 'TaskTag',
  });
  return TaskTag;
};