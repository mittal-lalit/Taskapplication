'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {
  }
  Tag.init({
    id:{type:DataTypes.INTEGER,primaryKey:true, autoIncrement:true},
    name: {type:DataTypes.STRING, unique:true, allowNull:false}
  }, {
    sequelize,
    modelName: 'Tag',
  },Tag.associate = (models) => {
    Tag.belongsToMany(models.Task, {
      through: 'tasktags',
      foreignKey: 'tagId',
      otherKey: 'taskId'
    });
  }
);
  return Tag;
};