'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class pedido extends Model {
    static associate(models) {
      pedido.belongsTo(models.carrito, {
        foreignKey: 'carritoid',
        as: 'carrito'
      });

      pedido.belongsTo(models.usuario, {
        foreignKey: 'usuarioid',
        as: 'usuario'
      });
    }
  }

  pedido.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    carritoid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    usuarioid: {
      type: DataTypes.UUID,
      allowNull: false
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'CREADO'
    }
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'pedido',
  });

  return pedido;
};
