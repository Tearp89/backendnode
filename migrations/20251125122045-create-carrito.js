'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('carrito', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      usuarioid: {
        type: Sequelize.UUID,      // ✅ MISMO tipo que usuario.id
        allowNull: false,
        references: {
          model: 'usuario',        // ✅ mismo nombre de tabla
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      estado: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'ACTIVO'
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
    await queryInterface.dropTable('carrito')
  }
}
