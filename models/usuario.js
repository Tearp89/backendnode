'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class usuario extends Model {
    static associate(models) {
      usuario.belongsTo(models.rol);

      usuario.hasMany(models.carrito, {
        foreignKey: 'usuarioid',
        as: 'carritos'
      });
    }
  }

  usuario.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    protegido: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    rolId: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'usuario',
  });
  return usuario;
};