'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class carrito extends Model {
    static associate(models) {
      // carrito pertenece a un usuario
      carrito.belongsTo(models.usuario, {
        foreignKey: 'usuarioid',
        as: 'usuario'
      });

      // carrito tiene muchos productos a través de carritoproducto
      carrito.belongsToMany(models.producto, {
        through: models.carritoproducto,
        foreignKey: 'carritoid',
        otherKey: 'productoid',
        as: 'productos'
      });
    }
  }

  carrito.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    usuarioid: {
      type: DataTypes.UUID,
      allowNull: false
    },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'ACTIVO'
    }
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'carrito',
  });

  return carrito;
};
