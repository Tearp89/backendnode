'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('carritoproducto', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      carritoid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'carrito',   // 👈 tabla del carrito
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      productoid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'producto',  // 👈 tabla de productos (ajusta si tu tabla se llama distinto)
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      precioUnitario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('carritoproducto') // 👈 mismo nombre que en createTable
  }
}
