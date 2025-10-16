'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class producto extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      producto.belongsToMany(models.categoria, {as: 'categorias', through: 'categoriaproducto', foreignkey: 'productoid'});
      producto.belongsTo(models.archivo);
    }
  }
  producto.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    titulo: {
      type: DataTypes.STRING,
      defaultValue: "Sin titulo"
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: "Sin descripción"
    },
    precio: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
    }
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'producto',
  });
  return producto;
};