'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PreviousEmployee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PreviousEmployee.init({
    email: DataTypes.STRING,
    roles: DataTypes.STRING,
    removedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'PreviousEmployee',
  });
  return PreviousEmployee;
};