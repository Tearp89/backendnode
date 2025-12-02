'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class carritoproducto extends Model {
    static associate(models) {
      carritoproducto.belongsTo(models.carrito, {
        foreignKey: 'carritoid',
        as: 'carrito'
      });

      carritoproducto.belongsTo(models.producto, {
        foreignKey: 'productoid',
        as: 'producto'
      });
    }
  }

  carritoproducto.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    carritoid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productoid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    precioUnitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'carritoproducto',
  });

  return carritoproducto;
};
