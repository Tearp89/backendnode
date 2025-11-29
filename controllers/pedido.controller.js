const { pedido, carrito, carritoproducto, producto, usuario } = require('../models')
const ClaimTypes = require('../config/claimtypes')

let self = {}

// GET: /api/pedidos
// Pedidos del usuario logueado
self.getMyOrders = async function (req, res, next) {
  try {
    const email = req.decodedToken[ClaimTypes.Name]

    const user = await usuario.findOne({ where: { email } })
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado' })

    const orders = await pedido.findAll({
      where: { usuarioid: user.id },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: carrito,
          as: 'carrito',
          include: {
            model: producto,
            as: 'productos',
            attributes: ['id', 'titulo', 'precio'],
            through: {
              model: carritoproducto,
              attributes: ['id', 'cantidad', 'precioUnitario', 'subtotal']
            }
          }
        }
      ]
    })

    res.status(200).json(orders)
  } catch (error) {
    next(error)
  }
}

// GET: /api/pedidos/:id
// Detalle de un pedido (solo si es tuyo o, si luego quieres, lo limitas por rol en ruta)
self.getById = async function (req, res, next) {
  try {
    const pedidoId = req.params.id
    const email = req.decodedToken[ClaimTypes.Name]

    const user = await usuario.findOne({ where: { email } })
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado' })

    const order = await pedido.findByPk(pedidoId, {
      include: [
        {
          model: carrito,
          as: 'carrito',
          include: {
            model: producto,
            as: 'productos',
            attributes: ['id', 'titulo', 'precio'],
            through: {
              model: carritoproducto,
              attributes: ['id', 'cantidad', 'precioUnitario', 'subtotal']
            }
          }
        }
      ]
    })

    if (!order) return res.status(404).json({ mensaje: 'Pedido no encontrado' })

    // Verificar que el pedido es del usuario logueado
    if (order.usuarioid !== user.id) {
      return res.status(403).json({ mensaje: 'No tienes permiso para ver este pedido' })
    }

    res.status(200).json(order)
  } catch (error) {
    next(error)
  }
}

// GET: /api/pedidos/admin/todos
// Listado de todos los pedidos (solo Admin - control en ruta)
self.getAll = async function (req, res, next) {
  try {
    const orders = await pedido.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: usuario,
          as: 'usuario',
          attributes: ['id', 'email', 'nombre']
        },
        {
          model: carrito,
          as: 'carrito',
          include: {
            model: producto,
            as: 'productos',
            attributes: ['id', 'titulo', 'precio'],
            through: {
              model: carritoproducto,
              attributes: ['id', 'cantidad', 'precioUnitario', 'subtotal']
            }
          }
        }
      ]
    })

    res.status(200).json(orders)
  } catch (error) {
    next(error)
  }
}

module.exports = self
